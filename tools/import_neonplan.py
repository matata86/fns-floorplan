#!/usr/bin/env python3
"""One-off import of a NeonPlan 3D building into FNS Floorplan.

    python3 import_neonplan.py building.json [extras.json] > plan.json

building.json  the result of the websocket command `neonplan3d/building/get`
               (either the whole result or just its "building").
extras.json    optional: things NeonPlan does not know, merged on top:
               {"devices": [...], "labels": {room_id: [x, z]}, "outdoor": room_id,
                "room_rules": {room_id: [rules]}, "furniture_rules": {furniture_id: [rules]},
                "furniture_patch": {furniture_id: {field: value}}}

Save the plan with the websocket command
    {"type": "fns_floorplan/plan/save", "plan": <plan.json>}
"""

import json
import sys

LIGHT_TYPES = ("lamp", "led")


def entity(value):
    """NeonPlan writes "none" for an explicitly empty sensor."""
    return value if value and value != "none" else None


def convert(building, extras=None):
    building = building.get("building", building)
    floor = building["floors"][0]
    rooms = [
        {
            "id": r["id"],
            "name": r["name"],
            "points": r["points"],
            "temperature": entity((r.get("climate") or {}).get("temperature")),
            "humidity": entity((r.get("climate") or {}).get("humidity")),
        }
        for r in floor["rooms"]
    ]
    openings = [
        {k: o.get(k) for k in ("id", "room_id", "edge", "offset", "width", "type", "style", "hinge", "swing")}
        # NeonPlan gives a window without a contact the room's contact; here no contact means no sensor
        | {"contact": entity(o.get("contact"))}
        for o in floor["openings"]
    ]
    furniture = []
    vacuum = None
    for f in floor["furniture"]:
        item = {k: f.get(k) for k in ("id", "type", "x", "z", "rotation", "w", "d")}
        ent = entity(f.get("entity"))
        if ent and (f["type"].startswith(LIGHT_TYPES) or f["type"] in ("tv_wall", "robot_vacuum")):
            item["entity"] = ent
        if f.get("room_light") is not None:
            item["room_light"] = f["room_light"]
        if f["type"] == "robot_vacuum" and ent:
            vacuum = {"entity": ent, "room_sensor": entity(f.get("room_sensor"))}
        furniture.append(item)
    sensors = [
        {"entity": p["entity_id"], "x": p["x"], "z": p["z"]}
        for p in floor.get("placements", [])
        if p["entity_id"].startswith("binary_sensor.")
    ]
    plan = {
        "version": 1,
        "rooms": rooms,
        "openings": openings,
        "furniture": furniture,
        "sensors": sensors,
        "vacuum": vacuum,
        "devices": [],
        "labels": {},
        "outdoor": None,
    }
    extras = dict(extras or {})
    for key, items in (("room_rules", rooms), ("furniture_rules", furniture)):
        by_id = extras.pop(key, {})
        for item in items:
            if item["id"] in by_id:
                item["rules"] = by_id[item["id"]]
    # small corrections on top of NeonPlan, e.g. {"f_bed": {"x": 1.6}}
    patch = extras.pop("furniture_patch", {})
    for item in furniture:
        item.update(patch.get(item["id"], {}))
    plan.update(extras)
    return plan


def demo():
    b = {
        "floors": [
            {
                "rooms": [{"id": "a", "name": "A", "points": [[0, 0], [1, 0], [1, 1]], "climate": {"temperature": "sensor.t", "humidity": "none"}}],
                "openings": [{"id": "w", "room_id": "a", "edge": 0, "offset": 0.5, "width": 0.4, "type": "window", "contact": "none"}],
                "furniture": [
                    {"id": "l", "type": "lamp_ceiling", "x": 0.5, "z": 0.5, "w": 0.3, "d": 0.3, "entity": "light.a", "room_light": False},
                    {"id": "s", "type": "sofa", "x": 0.5, "z": 0.5, "w": 1, "d": 1, "entity": "none"},
                    {"id": "v", "type": "robot_vacuum", "x": 0, "z": 0, "w": 0.3, "d": 0.3, "entity": "vacuum.v", "room_sensor": "sensor.r"},
                ],
                "placements": [{"entity_id": "binary_sensor.pir", "x": 1, "z": 1}, {"entity_id": "switch.x", "x": 0, "z": 0}],
            }
        ]
    }
    p = convert({"building": b}, {"outdoor": "a", "room_rules": {"a": [{"color": "red"}]}})
    assert p["rooms"][0]["rules"] == [{"color": "red"}] and "room_rules" not in p
    assert p["rooms"][0]["temperature"] == "sensor.t" and p["rooms"][0]["humidity"] is None
    assert p["openings"][0]["contact"] is None
    assert p["furniture"][0]["entity"] == "light.a" and p["furniture"][0]["room_light"] is False
    assert "entity" not in p["furniture"][1]
    assert p["vacuum"] == {"entity": "vacuum.v", "room_sensor": "sensor.r"}
    assert p["sensors"] == [{"entity": "binary_sensor.pir", "x": 1, "z": 1}]
    assert p["outdoor"] == "a"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        demo()
        print("self-check ok", file=sys.stderr)
        sys.exit(0)
    building = json.load(open(sys.argv[1], encoding="utf-8"))
    extras = json.load(open(sys.argv[2], encoding="utf-8")) if len(sys.argv) > 2 else None
    json.dump(convert(building, extras), sys.stdout, ensure_ascii=False, indent=1)
