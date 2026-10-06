// FNS Floorplan card: an animated 2D floor plan with the home's live state.
// The plan comes from the fns_floorplan integration (websocket fns_floorplan/plan/get).

const VERSION = "0.6.35";
// Material Design Icons paths (the icon set HA uses), 24×24
const MDI = {"mdiSpotlightBeam":"M9,16.5L9.91,15.59L15.13,20.8L14.21,21.71L9,16.5M15.5,10L16.41,9.09L21.63,14.3L20.71,15.21L15.5,10M6.72,2.72L10.15,6.15L6.15,10.15L2.72,6.72C1.94,5.94 1.94,4.67 2.72,3.89L3.89,2.72C4.67,1.94 5.94,1.94 6.72,2.72M14.57,7.5L15.28,8.21L8.21,15.28L7.5,14.57L6.64,11.07L11.07,6.64L14.57,7.5Z","mdiFan":"M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z","mdiAirPurifier":"M11,9A4,4 0 0,1 15,13A4,4 0 0,1 11,17A4,4 0 0,1 7,13A4,4 0 0,1 11,9M11,11A2,2 0 0,0 9,13A2,2 0 0,0 11,15A2,2 0 0,0 13,13A2,2 0 0,0 11,11M7,4H14A4,4 0 0,1 18,8V9H16V8A2,2 0 0,0 14,6H7A2,2 0 0,0 5,8V20H16V18H18V22H3V8A4,4 0 0,1 7,4M16,11C18.5,11 18.5,9 21,9V11C18.5,11 18.5,13 16,13V11M16,15C18.5,15 18.5,13 21,13V15C18.5,15 18.5,17 16,17V15Z","mdiDishwasher":"M18,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V4A2,2 0 0,0 18,2M10,4A1,1 0 0,1 11,5A1,1 0 0,1 10,6A1,1 0 0,1 9,5A1,1 0 0,1 10,4M7,4A1,1 0 0,1 8,5A1,1 0 0,1 7,6A1,1 0 0,1 6,5A1,1 0 0,1 7,4M18,20H6V8H18V20M14.67,15.33C14.69,16.03 14.41,16.71 13.91,17.21C12.86,18.26 11.15,18.27 10.09,17.21C9.59,16.71 9.31,16.03 9.33,15.33C9.4,14.62 9.63,13.94 10,13.33C10.37,12.5 10.81,11.73 11.33,11L12,10C13.79,12.59 14.67,14.36 14.67,15.33","mdiTumbleDryer":"M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4M10,4A1,1 0 0,0 9,5A1,1 0 0,0 10,6A1,1 0 0,0 11,5A1,1 0 0,0 10,4M12,8A6,6 0 0,0 6,14A6,6 0 0,0 12,20A6,6 0 0,0 18,14A6,6 0 0,0 12,8M8.11,10.5H10C9.76,11.88 10,12.67 10.58,13.29C11.68,14.36 12.16,15.71 11.89,17.5H10C10.24,16.12 10,15.33 9.42,14.71C8.32,13.64 7.85,12.29 8.11,10.5M12.11,10.5H14C13.76,11.88 14,12.67 14.58,13.29C15.68,14.36 16.16,15.71 15.89,17.5H14C14.24,16.12 14,15.33 13.42,14.71C12.32,13.64 11.85,12.29 12.11,10.5Z","mdiWaterBoiler":"M8 2C6.89 2 6 2.89 6 4V16C6 17.11 6.89 18 8 18H9V20H6V22H9C10.11 22 11 21.11 11 20V18H13V20C13 21.11 13.89 22 15 22H18V20H15V18H16C17.11 18 18 17.11 18 16V4C18 2.89 17.11 2 16 2H8M12 4.97A2 2 0 0 1 14 6.97A2 2 0 0 1 12 8.97A2 2 0 0 1 10 6.97A2 2 0 0 1 12 4.97M10 14.5H14V16H10V14.5Z","mdiFire":"M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z","mdiCeilingLight":"M8,9H11V4H13V9H16L20,17H4L8,9M14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18H14Z","mdiLamp":"M8,2H16L20,14H4L8,2M11,15H13V20H18V22H6V20H11V15Z","mdiWallSconceFlat":"M5,5V11H19V5H5M5.27,13.32L3.5,15.09L4.91,16.5L6.68,14.73L5.27,13.32M18.73,13.32L17.32,14.73L19.09,16.5L20.5,15.09L18.73,13.32M11,16V19H13V16H11Z","mdiLightbulbOn":"M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z","mdiWindowOpenVariant":"M21 20V2H3V20H1V23H23V20M19 4V11H17V4M5 4H7V11H5M5 20V13H7V20M9 20V4H15V20M17 20V13H19V20Z","mdiWaterAlert":"M10 3.25C10 3.25 16 10 16 14C16 17.31 13.31 20 10 20S4 17.31 4 14C4 10 10 3.25 10 3.25M20 7V13H18V7H20M18 17H20V15H18V17Z","mdiThermometer":"M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z","mdiRobotVacuum":"M12,2C14.65,2 17.19,3.06 19.07,4.93L17.65,6.35C16.15,4.85 14.12,4 12,4C9.88,4 7.84,4.84 6.35,6.35L4.93,4.93C6.81,3.06 9.35,2 12,2M3.66,6.5L5.11,7.94C4.39,9.17 4,10.57 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,10.57 19.61,9.17 18.88,7.94L20.34,6.5C21.42,8.12 22,10.04 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12C2,10.04 2.58,8.12 3.66,6.5M12,6A6,6 0 0,1 18,12C18,13.59 17.37,15.12 16.24,16.24L14.83,14.83C14.08,15.58 13.06,16 12,16C10.94,16 9.92,15.58 9.17,14.83L7.76,16.24C6.63,15.12 6,13.59 6,12A6,6 0 0,1 12,6M12,8A1,1 0 0,0 11,9A1,1 0 0,0 12,10A1,1 0 0,0 13,9A1,1 0 0,0 12,8Z","mdiWeatherNight":"M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z","mdiWhiteBalanceSunny":"M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13","mdiClockOutline":"M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z","rWave1":"M7.95,3L6.53,5.19L7.95,7.4H7.94L5.95,10.5L4.22,9.6L5.64,7.39L4.22,5.19L6.22,2.09L7.95,3","rWave2":"M13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L11.95,10.4L10.22,9.5L11.64,7.3L10.22,5.1L12.22,2L13.95,2.89","rWave3":"M20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89","rBody":"M2,22V14A2,2 0 0,1 4,12H20A2,2 0 0,1 22,14V22H20V20H4V22H2M6,14A1,1 0 0,0 5,15V17A1,1 0 0,0 6,18A1,1 0 0,0 7,17V15A1,1 0 0,0 6,14M10,14A1,1 0 0,0 9,15V17A1,1 0 0,0 10,18A1,1 0 0,0 11,17V15A1,1 0 0,0 10,14M14,14A1,1 0 0,0 13,15V17A1,1 0 0,0 14,18A1,1 0 0,0 15,17V15A1,1 0 0,0 14,14M18,14A1,1 0 0,0 17,15V17A1,1 0 0,0 18,18A1,1 0 0,0 19,17V15A1,1 0 0,0 18,14Z","mdiBedDoubleOutline":"M8 5C7.5 5 7 5.21 6.61 5.6S6 6.45 6 7V10C5.47 10 5 10.19 4.59 10.59S4 11.47 4 12V17H5.34L6 19H7L7.69 17H16.36L17 19H18L18.66 17H20V12C20 11.47 19.81 11 19.41 10.59S18.53 10 18 10V7C18 6.45 17.8 6 17.39 5.6S16.5 5 16 5M8 7H11V10H8M13 7H16V10H13M6 12H18V15H6Z","mdiBunkBedOutline":"M1 2H3V9H10V3H19C21.2 3 23 4.8 23 7V23H21V21H3V23H1V2M12 5V9H21V7C21 5.9 20.1 5 19 5H12M3 11V19H10V13H19C19.7 13 20.4 13.2 21 13.6V11H3M6.5 13C7.9 13 9 14.1 9 15.5S7.9 18 6.5 18 4 16.9 4 15.5 5.1 13 6.5 13M6.5 14.6C6 14.6 5.6 15 5.6 15.5S6 16.4 6.5 16.4 7.4 16 7.4 15.5 7 14.6 6.5 14.6M12 15V19H21V17C21 15.9 20.1 15 19 15H12M6.5 3C7.9 3 9 4.1 9 5.5S7.9 8 6.5 8 4 6.9 4 5.5 5.1 3 6.5 3M6.5 4.6C6 4.6 5.6 5 5.6 5.5S6 6.4 6.5 6.4 7.4 6 7.4 5.5 7 4.6 6.5 4.6Z","mdiDresserOutline":"M4 3C2.9 3 2 3.9 2 5V18C2 19.11 2.9 20 4 20V21H6V20H18V21H20V20C21.11 20 22 19.11 22 18V5C22 3.9 21.11 3 20 3H4M4 5H20V8H4V5M10 6V7H14V6H10M4 10H20V13H4V10M10 11V12H14V11H10M4 15H20V18H4V15M10 16V17H14V16H10Z","mdiWardrobeOutline":"M6 2C4.89 2 4 2.9 4 4V19C4 20.11 4.89 21 6 21V22H8V21H16V22H18V21C19.11 21 20 20.11 20 19V4C20 2.9 19.11 2 18 2H6M6 4H11V19H6V4M13 4H18V19H13V4M8 10V13H10V10H8M14 10V13H16V10H14Z","mdiBookshelf":"M9 3V18H12V3H9M12 5L16 18L19 17L15 4L12 5M5 5V18H8V5H5M3 19V21H21V19H3Z","mdiFileCabinet":"M14,8H10V6H14V8M20,4V20C20,21.11 19.11,22 18,22H6C4.89,22 4,21.11 4,20V4A2,2 0 0,1 6,2H18C19.11,2 20,2.9 20,4M18,13H6V20H18V13M18,4H6V11H18V4M14,15H10V17H14V15Z","mdiCupboardOutline":"M7 2C5.9 2 5 2.9 5 4V19C5 20.11 5.9 21 7 21V22H9V21H15V22H17V21C18.11 21 19 20.11 19 19V4C19 2.9 18.11 2 17 2H7M7 4H17V7H7V4M7 9H17V12H7V9M7 14H11V19H7V14M13 14H17V19H13V14M8 15V18H10V15H8M14 15V18H16V15H14Z","mdiSofaOutline":"M21 9V7C21 5.35 19.65 4 18 4H14C13.23 4 12.53 4.3 12 4.78C11.47 4.3 10.77 4 10 4H6C4.35 4 3 5.35 3 7V9C1.35 9 0 10.35 0 12V17C0 18.65 1.35 20 3 20V22H5V20H19V22H21V20C22.65 20 24 18.65 24 17V12C24 10.35 22.65 9 21 9M14 6H18C18.55 6 19 6.45 19 7V9.78C18.39 10.33 18 11.12 18 12V14H13V7C13 6.45 13.45 6 14 6M5 7C5 6.45 5.45 6 6 6H10C10.55 6 11 6.45 11 7V14H6V12C6 11.12 5.61 10.33 5 9.78V7M22 17C22 17.55 21.55 18 21 18H3C2.45 18 2 17.55 2 17V12C2 11.45 2.45 11 3 11S4 11.45 4 12V16H20V12C20 11.45 20.45 11 21 11S22 11.45 22 12V17Z","mdiTable":"M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z","mdiTableFurniture":"M2 7H22V10H20L21 19H18.5L17.94 14H6.06L5.5 19H3L4 10H2V7M17.5 10H6.5L6.29 12H17.71L17.5 10Z","mdiChairSchool":"M22,5V7H17L13.53,12H16V14H14.46L18.17,22H15.97L15.04,20H6.38L5.35,22H3.1L7.23,14H7C6.55,14 6.17,13.7 6.04,13.3L2.87,3.84L3.82,3.5C4.34,3.34 4.91,3.63 5.08,4.15L7.72,12H12.1L15.57,7H12V5H22M9.5,14L7.42,18H14.11L12.26,14H9.5Z","mdiDesk":"M3 6H21C21.55 6 22 6.45 22 7C22 7.55 21.55 8 21 8V19H19V17H15V19H13V8H5V19H3V8C2.45 8 2 7.55 2 7C2 6.45 2.45 6 3 6M16 10.5V11H18V10.5C18 10.22 17.78 10 17.5 10H16.5C16.22 10 16 10.22 16 10.5M16 14.5V15H18V14.5C18 14.22 17.78 14 17.5 14H16.5C16.22 14 16 14.22 16 14.5Z","mdiChairRolling":"M22 10V13H19V10H22M2 13H5V10H2V13M17 5C17 3.9 16.1 3 15 3H9C7.9 3 7 3.9 7 5V13H17V5M7 15H6V17H11V18L7 22H9.8L12 19.8L14.2 22H17L13 18V17H18V15H7Z","mdiBench":"M23 13H1V15H3V19H5V15H19V19H21V15H23V13Z","mdiCoatRack":"M18.33 7.78A1 1 0 0 0 16.66 8.89A2 2 0 1 1 13 10V7.82A3 3 0 1 0 11 7.82V10A2 2 0 1 1 7.34 8.89A1 1 0 1 0 5.67 7.78A4 4 0 0 0 11 13.46V20A2 2 0 0 0 9 22H15A2 2 0 0 0 13 20V13.46A4 4 0 0 0 18.33 7.78M12 4A1 1 0 1 1 11 5A1 1 0 0 1 12 4Z","mdiTelevision":"M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z","mdiCountertopOutline":"M22 10H18V7C18 5.34 16.66 4 15 4S12 5.34 12 7H14C14 6.45 14.45 6 15 6S16 6.45 16 7V10H8C9.1 10 10 9.1 10 8V4H4V8C4 9.1 4.9 10 6 10H2V12H4V20H20V12H22V10M6 6H8V8H6V6M6 18V12H11V18H6M18 18H13V12H18V18Z","mdiFridgeOutline":"M9,21V22H7V21A2,2 0 0,1 5,19V4A2,2 0 0,1 7,2H17A2,2 0 0,1 19,4V19A2,2 0 0,1 17,21V22H15V21H9M7,4V9H17V4H7M7,19H17V11H7V19M8,12H10V15H8V12M8,6H10V8H8V6Z","mdiFaucet":"M19 14V16H16V14.28L19 14M19 13C19 11.9 18 11 16.8 11H10V10H5V21H10V13.91L19 13M5 9H10V7L15.36 5.21C15.74 5.09 16 4.73 16 4.33C16 3.68 15.36 3.23 14.75 3.45L5 7V9Z","mdiStove":"M6,14H8L11,17H9L6,14M4,4H5V3A1,1 0 0,1 6,2H10A1,1 0 0,1 11,3V4H13V3A1,1 0 0,1 14,2H18A1,1 0 0,1 19,3V4H20A2,2 0 0,1 22,6V19A2,2 0 0,1 20,21V22H17V21H7V22H4V21A2,2 0 0,1 2,19V6A2,2 0 0,1 4,4M18,7A1,1 0 0,1 19,8A1,1 0 0,1 18,9A1,1 0 0,1 17,8A1,1 0 0,1 18,7M14,7A1,1 0 0,1 15,8A1,1 0 0,1 14,9A1,1 0 0,1 13,8A1,1 0 0,1 14,7M20,6H4V10H20V6M4,19H20V12H4V19M6,7A1,1 0 0,1 7,8A1,1 0 0,1 6,9A1,1 0 0,1 5,8A1,1 0 0,1 6,7M13,14H15L18,17H16L13,14Z","mdiWashingMachine":"M14.83,11.17C16.39,12.73 16.39,15.27 14.83,16.83C13.27,18.39 10.73,18.39 9.17,16.83L14.83,11.17M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4M10,4A1,1 0 0,0 9,5A1,1 0 0,0 10,6A1,1 0 0,0 11,5A1,1 0 0,0 10,4M12,8A6,6 0 0,0 6,14A6,6 0 0,0 12,20A6,6 0 0,0 18,14A6,6 0 0,0 12,8Z","mdiBathtubOutline":"M7 5C8.11 5 9 5.9 9 7S8.11 9 7 9 5 8.11 5 7 5.9 5 7 5M20 13V4.83C20 3.27 18.73 2 17.17 2C16.42 2 15.7 2.3 15.17 2.83L13.92 4.08C13.76 4.03 13.59 4 13.41 4C13 4 12.64 4.12 12.33 4.32L15.09 7.08C15.29 6.77 15.41 6.4 15.41 6C15.41 5.82 15.38 5.66 15.34 5.5L16.59 4.24C16.74 4.09 16.95 4 17.17 4C17.63 4 18 4.37 18 4.83V13H11.15C10.85 12.79 10.58 12.55 10.33 12.28L8.93 10.73C8.74 10.5 8.5 10.35 8.24 10.23C7.93 10.08 7.59 10 7.24 10C6 10 5 11 5 12.25V13H2V19C2 20.1 2.9 21 4 21C4 21.55 4.45 22 5 22H19C19.55 22 20 21.55 20 21C21.1 21 22 20.1 22 19V13H20M20 19H4V15H20V19Z","mdiShower":"M21,14V15C21,16.91 19.93,18.57 18.35,19.41L19,22H17L16.5,20C16.33,20 16.17,20 16,20H8C7.83,20 7.67,20 7.5,20L7,22H5L5.65,19.41C4.07,18.57 3,16.91 3,15V14H2V12H20V5A1,1 0 0,0 19,4C18.5,4 18.12,4.34 18,4.79C18.63,5.33 19,6.13 19,7H13A3,3 0 0,1 16,4C16.06,4 16.11,4 16.17,4C16.58,2.84 17.69,2 19,2A3,3 0 0,1 22,5V14H21V14M19,14H5V15A3,3 0 0,0 8,18H16A3,3 0 0,0 19,15V14Z","mdiToilet":"M9,22H17V19.5C19.41,17.87 21,15.12 21,12V4A2,2 0 0,0 19,2H15C13.89,2 13,2.9 13,4V12H3C3,15.09 5,18 9,19.5V22M5.29,14H18.71C18.14,15.91 16.77,17.5 15,18.33V20H11V18.33C9,18 5.86,15.91 5.29,14M15,4H19V12H15V4M16,5V8H18V5H16Z","mdiRadiator":"M7.95,3L6.53,5.19L7.95,7.4H7.94L5.95,10.5L4.22,9.6L5.64,7.39L4.22,5.19L6.22,2.09L7.95,3M13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L11.95,10.4L10.22,9.5L11.64,7.3L10.22,5.1L12.22,2L13.95,2.89M20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89M2,22V14A2,2 0 0,1 4,12H20A2,2 0 0,1 22,14V22H20V20H4V22H2M6,14A1,1 0 0,0 5,15V17A1,1 0 0,0 6,18A1,1 0 0,0 7,17V15A1,1 0 0,0 6,14M10,14A1,1 0 0,0 9,15V17A1,1 0 0,0 10,18A1,1 0 0,0 11,17V15A1,1 0 0,0 10,14M14,14A1,1 0 0,0 13,15V17A1,1 0 0,0 14,18A1,1 0 0,0 15,17V15A1,1 0 0,0 14,14M18,14A1,1 0 0,0 17,15V17A1,1 0 0,0 18,18A1,1 0 0,0 19,17V15A1,1 0 0,0 18,14Z","mdiLedStripVariant":"M2.95 3L2 6.91L19.34 11.25L20.29 7.34L2.95 3M6.09 6.89L4.16 6.41L4.64 4.46L6.57 4.94L6.09 6.89M9.94 7.86L8 7.38L8.5 5.42L10.42 5.91L9.94 7.86M13.8 8.82L11.87 8.34L12.35 6.39L14.27 6.87L13.8 8.82M17.65 9.79L15.72 9.31L16.2 7.35L18.13 7.84L17.65 9.79M4.66 12.75L3.71 16.66L21.05 21L22 17.1L4.66 12.75M7.8 16.65L5.88 16.16L6.35 14.21L8.28 14.69L7.8 16.65M11.65 17.61L9.73 17.13L10.2 15.18L12.13 15.66L11.65 17.61M15.5 18.58L13.58 18.09L14.06 16.14L16 16.62L15.5 18.58M19.36 19.54L17.43 19.06L17.91 17.11L19.84 17.59L19.36 19.54M6.25 12.11L11 10.2L17.75 11.89L13 13.8L6.25 12.11Z","mdiMotionSensor":"M10,0.2C9,0.2 8.2,1 8.2,2C8.2,3 9,3.8 10,3.8C11,3.8 11.8,3 11.8,2C11.8,1 11,0.2 10,0.2M15.67,1A7.33,7.33 0 0,0 23,8.33V7A6,6 0 0,1 17,1H15.67M18.33,1C18.33,3.58 20.42,5.67 23,5.67V4.33C21.16,4.33 19.67,2.84 19.67,1H18.33M21,1A2,2 0 0,0 23,3V1H21M7.92,4.03C7.75,4.03 7.58,4.06 7.42,4.11L2,5.8V11H3.8V7.33L5.91,6.67L2,22H3.8L6.67,13.89L9,17V22H10.8V15.59L8.31,11.05L9.04,8.18L10.12,10H15V8.2H11.38L9.38,4.87C9.08,4.37 8.54,4.03 7.92,4.03Z","mdiCheckboxBlankCircleOutline":"M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z","mdiShieldOffOutline":"M1,4.27L3,6.27V11C3,16.55 6.84,21.74 12,23C13.87,22.54 15.57,21.56 16.97,20.24L19.23,22.5L20.5,21.22L2.28,3L1,4.27M12,21C8.25,20 5,15.54 5,11.22V8.27L15.59,18.86C14.53,19.89 13.3,20.65 12,21M21,5V11C21,13.28 20.35,15.5 19.23,17.4L17.77,15.95C18.54,14.5 19,12.84 19,11.22V6.3L12,3.18L7.16,5.34L5.65,3.82L12,1L21,5Z","mdiShieldHome":"M11,13H13V16H16V11H18L12,6L6,11H8V16H11V13M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z","mdiShieldLock":"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z","mdiShieldMoon":"M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M15.97 14.41C14.13 16.58 10.76 16.5 9 14.34C6.82 11.62 8.36 7.62 11.7 7C12.04 6.95 12.33 7.28 12.21 7.61C11.75 8.84 11.82 10.25 12.53 11.47C13.24 12.69 14.42 13.46 15.71 13.67C16.05 13.72 16.2 14.14 15.97 14.41Z","mdiShieldAirplane":"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5.68C12.5,5.68 12.95,6.11 12.95,6.63V10.11L18,13.26V14.53L12.95,12.95V16.42L14.21,17.37V18.32L12,17.68L9.79,18.32V17.37L11.05,16.42V12.95L6,14.53V13.26L11.05,10.11V6.63C11.05,6.11 11.5,5.68 12,5.68Z","mdiShieldSync":"M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z","mdiShieldAlert":"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5M11,7H13V13H11M11,15H13V17H11","mdiShieldOutline":"M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21Z","mdiBellRing":"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z","mdiSpeaker":"M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M17,2H7C5.89,2 5,2.89 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V4C19,2.89 18.1,2 17,2Z","mdiAudioVideo":"M20,7H4A2,2 0 0,0 2,9V15A2,2 0 0,0 4,17H5V18C5,18.6 5.4,19 6,19H8C8.6,19 9,18.6 9,18V17H15V18C15,18.6 15.4,19 16,19H18C18.6,19 19,18.6 19,18V17H20A2,2 0 0,0 22,15V9A2,2 0 0,0 20,7M14,12H4V10H14V12M18,13A2,2 0 0,1 16,11A2,2 0 0,1 18,9A2,2 0 0,1 20,11A2,2 0 0,1 18,13M6,15H4V14H6V15M10,15H8V14H10V15M14,15H12V14H14V15Z","mdiCastVariant":"M6,22H18L12,16M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H7V17H3V5H21V17H17V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z","mdiKodi":"M12.03,1C11.82,1 11.6,1.11 11.41,1.31C10.56,2.16 9.72,3 8.88,3.84C8.66,4.06 8.6,4.18 8.38,4.38C8.09,4.62 7.96,4.91 7.97,5.28C8,6.57 8,7.84 8,9.13C8,10.46 8,11.82 8,13.16C8,13.26 8,13.34 8.03,13.44C8.11,13.75 8.31,13.82 8.53,13.59C9.73,12.39 10.8,11.3 12,10.09C13.36,8.73 14.73,7.37 16.09,6C16.5,5.6 16.5,5.15 16.09,4.75C14.94,3.6 13.77,2.47 12.63,1.31C12.43,1.11 12.24,1 12.03,1M18.66,7.66C18.45,7.66 18.25,7.75 18.06,7.94C16.91,9.1 15.75,10.24 14.59,11.41C14.2,11.8 14.2,12.23 14.59,12.63C15.74,13.78 16.88,14.94 18.03,16.09C18.43,16.5 18.85,16.5 19.25,16.09C20.36,15 21.5,13.87 22.59,12.75C22.76,12.58 22.93,12.42 23,12.19V11.88C22.93,11.64 22.76,11.5 22.59,11.31C21.47,10.19 20.37,9.06 19.25,7.94C19.06,7.75 18.86,7.66 18.66,7.66M4.78,8.09C4.65,8.04 4.58,8.14 4.5,8.22C3.35,9.39 2.34,10.43 1.19,11.59C0.93,11.86 0.93,12.24 1.19,12.5C1.81,13.13 2.44,13.75 3.06,14.38C3.6,14.92 4,15.33 4.56,15.88C4.72,16.03 4.86,16 4.94,15.81C5,15.71 5,15.58 5,15.47C5,14.29 5,13.37 5,12.19C5,11 5,9.81 5,8.63C5,8.55 5,8.45 4.97,8.38C4.95,8.25 4.9,8.14 4.78,8.09M12.09,14.25C11.89,14.25 11.66,14.34 11.47,14.53C10.32,15.69 9.18,16.87 8.03,18.03C7.63,18.43 7.63,18.85 8.03,19.25C9.14,20.37 10.26,21.47 11.38,22.59C11.54,22.76 11.71,22.93 11.94,23H12.22C12.44,22.94 12.62,22.79 12.78,22.63C13.9,21.5 15.03,20.38 16.16,19.25C16.55,18.85 16.5,18.4 16.13,18C14.97,16.84 13.84,15.69 12.69,14.53C12.5,14.34 12.3,14.25 12.09,14.25Z","mdiShapeOutline":"M11,13.5V21.5H3V13.5H11M9,15.5H5V19.5H9V15.5M12,2L17.5,11H6.5L12,2M12,5.86L10.08,9H13.92L12,5.86M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13M17.5,15A2.5,2.5 0 0,0 15,17.5A2.5,2.5 0 0,0 17.5,20A2.5,2.5 0 0,0 20,17.5A2.5,2.5 0 0,0 17.5,15Z","mdiFishbowlOutline":"M19.11,5H21V3H3V5H4.89C3.11,6.8 2,9.27 2,12C2,15.97 4.31,19.39 7.66,21H16.34C19.69,19.39 22,15.97 22,12C22,9.27 20.89,6.8 19.11,5M6.32,6.41L7.7,5H16.3L17.68,6.41C18.23,6.96 18.69,7.58 19.05,8.25C18,8.09 16.94,7.66 16,7C13.56,8.71 10.44,8.71 8,7C7.06,7.66 6,8.09 4.95,8.25C5.31,7.58 5.77,6.96 6.32,6.41M15.85,19H8.15C5.58,17.59 4,14.95 4,12C4,11.43 4.07,10.86 4.19,10.32C5.5,10.29 6.8,9.95 8,9.33C10.5,10.63 13.5,10.63 16,9.33C17.2,9.95 18.5,10.29 19.81,10.32C19.93,10.86 20,11.43 20,12C20,14.95 18.42,17.59 15.85,19M17,14.5C17,15.88 15.32,17 13.25,17C12.09,17 11.06,16.64 10.33,16.16C9.67,17 8.33,17 7,17C8.1,17 8.5,15.88 8.5,14.5C8.5,13.12 8.1,12 7,12C8.33,12 9.67,12 10.37,12.91C11.06,12.36 12.09,12 13.25,12C15.32,12 17,13.12 17,14.5Z","mdiCctv":"M6.03 12.03L8.03 15.5L5.5 18.68L2 12.62L6.03 12.03M17 18V15.29C17.88 14.9 18.5 14.03 18.5 13C18.5 12.43 18.3 11.9 17.97 11.5L19.94 10.35C20.95 9.76 21.3 8.47 20.71 7.46L19.33 5.06C18.74 4.05 17.45 3.7 16.44 4.28L8.31 9C7.36 9.53 7.03 10.75 7.58 11.71L9.08 14.31C9.63 15.26 10.86 15.59 11.81 15.04L13.69 13.96C13.94 14.55 14.41 15.03 15 15.29V18C15 19.1 15.9 20 17 20H22V18H17Z","mdiFireplace":"M22,22H2V20H22V22M22,6H2V3H22V6M20,7V19H17V11C17,11 14.5,10 12,10C9.5,10 7,11 7,11V19H4V7H20M14.5,14.67H14.47L14.81,15.22L14.87,15.34C15.29,16.35 15,17.5 14.21,18.24C13.5,18.9 12.5,19.07 11.58,18.95C10.71,18.84 9.9,18.29 9.45,17.53C9.3,17.3 9.19,17.03 9.13,16.77L9,16.11C8.96,15.15 9.34,14.14 10.06,13.54C9.73,14.26 9.81,15.16 10.3,15.79L10.36,15.87C10.44,15.94 10.55,15.97 10.64,15.92C10.73,15.89 10.8,15.8 10.8,15.7L10.76,15.56C10.23,14.17 10.68,12.55 11.79,11.63C12.1,11.38 12.5,11.15 12.87,11.05C12.46,11.87 12.61,12.93 13.25,13.57L14.14,14.3L14.5,14.67M13.11,17.44V17.44C13.37,17.2 13.53,16.8 13.5,16.44V16.25C13.38,15.65 12.85,15.46 12.5,15L12.26,14.55C12.13,14.85 12.12,15.13 12.17,15.46C12.23,15.8 12.37,16.09 12.29,16.44C12.2,16.83 11.9,17.22 11.37,17.35C11.67,17.64 12.15,17.87 12.64,17.71L13.11,17.44Z","mdiTimerSand":"M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5M10,6H14V6.75L12,8.75L10,6.75V6Z","mdiSeatOutline":"M15,5V12H9V5H15M15,3H9A2,2 0 0,0 7,5V14H17V5A2,2 0 0,0 15,3M22,10H19V13H22V10M5,10H2V13H5V10M20,15H4V21H6V17H18V21H20V15Z","mdiLock":"M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z","mdiLockOpenVariant":"M18 1C15.24 1 13 3.24 13 6V8H4C2.9 8 2 8.89 2 10V20C2 21.11 2.9 22 4 22H16C17.11 22 18 21.11 18 20V10C18 8.9 17.11 8 16 8H15V6C15 4.34 16.34 3 18 3C19.66 3 21 4.34 21 6V8H23V6C23 3.24 20.76 1 18 1M10 13C11.1 13 12 13.89 12 15C12 16.11 11.11 17 10 17C8.9 17 8 16.11 8 15C8 13.9 8.9 13 10 13Z","mdiLockAlert":"M10 17C11.1 17 12 16.1 12 15C12 13.9 11.1 13 10 13C8.9 13 8 13.9 8 15S8.9 17 10 17M16 8C17.1 8 18 8.9 18 10V20C18 21.1 17.1 22 16 22H4C2.9 22 2 21.1 2 20V10C2 8.9 2.9 8 4 8H5V6C5 3.2 7.2 1 10 1S15 3.2 15 6V8H16M10 3C8.3 3 7 4.3 7 6V8H13V6C13 4.3 11.7 3 10 3M22 13H20V7H22V13M22 17H20V15H22V17Z","mdiLockClock":"M8.5,2C6,2 4,4 4,6.5V7C2.89,7 2,7.89 2,9V18C2,19.11 2.89,20 4,20H8.72C10.18,21.29 12.06,22 14,22A8,8 0 0,0 22,14A8,8 0 0,0 14,6C13.66,6 13.32,6.03 13,6.08C12.76,3.77 10.82,2 8.5,2M8.5,4A2.5,2.5 0 0,1 11,6.5V7H6V6.5A2.5,2.5 0 0,1 8.5,4M14,8A6,6 0 0,1 20,14A6,6 0 0,1 14,20A6,6 0 0,1 8,14A6,6 0 0,1 14,8M13,10V15L16.64,17.19L17.42,15.9L14.5,14.15V10H13Z"};
const S = 80; // px per metre
const PAD = 24;
const NS = "http://www.w3.org/2000/svg";
const LIGHT_DEFAULT = "#ffd9a0";
const OFF_STATES = new Set(["off", "standby", "unavailable", "unknown"]);
// colour names usable in rules; anything else is taken as a CSS colour
const COLORS = { red: "#ef4444", orange: "#f59e0b", yellow: "#facc15", green: "#4ade80", blue: "#60a5fa", purple: "#a855f7", pink: "#ec4899", white: "#f8fafc", black: "#000" };
// ui_color names from the HA colour picker
const UI_COLORS = new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","disabled"]);
// names from the HA colour picker map to theme variables; other values (hex, var(...), rgb(...)) stay as they are
const color = (c) => (UI_COLORS.has(c) ? `var(--${c}-color)` : COLORS[c] || c);
const MOTION_CLASSES = new Set(["motion", "occupancy", "presence"]);

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const P = ([x, z]) => [x * S + PAD, z * S + PAD];
const polyD = (pts) => "M" + pts.map(P).map((p) => p.join(",")).join("L") + "Z";
const mdiSvg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${MDI[name]}"/></svg>`;
// an MDI icon inside the plan: centred on 0,0 and `size` px big
const mdiPath = (name, size, cls = "") =>
  `<path class="${cls}" d="${MDI[name]}" transform="translate(${-size / 2} ${-size / 2}) scale(${size / 24})"/>`;
const inPoly = ([x, z], pts) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const centroid = (pts) => {
  let a = 0, cx = 0, cz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const f = x0 * z1 - x1 * z0;
    a += f; cx += (x0 + x1) * f; cz += (z0 + z1) * f;
  }
  return [cx / (3 * a), cz / (3 * a)];
};
const segInside = (a, b, pts) => {
  for (let t = 0.1; t < 1; t += 0.1) if (!inPoly([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], pts)) return false;
  return true;
};
const hex = (rgb) => "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
// colour temperature to RGB (Tanner Helland's approximation)
const kelvinHex = (k) => {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return hex([r, g, b]);
};
const num = (v, d = 1) => Number(v).toFixed(d).replace(".", ",");

// icon sizes XS–XXL of lights, appliances and the robot; furniture keeps its size in metres
const SIZES = { xs: 0.6, s: 0.8, m: 1, l: 1.25, xl: 1.5, xxl: 2 };
const sizeK = (item) => SIZES[item?.size] || 1;
// furniture: Czech name and MDI icon of every type
const FURNITURE = {
  bed: ["Postel", "mdiBedDoubleOutline"], bunk_bed: ["Patrová postel", "mdiBunkBedOutline"], nightstand: ["Noční stolek", "mdiDresserOutline"],
  wardrobe: ["Šatní skříň", "mdiWardrobeOutline"], dresser: ["Komoda", "mdiDresserOutline"], shelf: ["Police, knihovna", "mdiBookshelf"],
  tall_cabinet: ["Vysoká skříň", "mdiFileCabinet"], sideboard: ["Příborník", "mdiCupboardOutline"], sofa: ["Pohovka", "mdiSofaOutline"],
  coffee_table: ["Konferenční stolek", "mdiTable"], table: ["Stůl", "mdiTableFurniture"], chair: ["Židle", "mdiSeatOutline"],
  desk: ["Psací stůl", "mdiDesk"], office_chair: ["Kancelářská židle", "mdiChairRolling"], bench: ["Lavice", "mdiBench"],
  coat_rack: ["Věšák", "mdiCoatRack"], tv_board: ["TV stolek", "mdiCupboardOutline"], tv_wall: ["Televize na zdi", "mdiTelevision"],
  kitchen: ["Kuchyňská linka", "mdiCountertopOutline"], kitchen_wall: ["Horní skříňky", "mdiCupboardOutline"],
  kitchen_tall: ["Vysoká kuchyňská skříň", "mdiCupboardOutline"], fridge: ["Lednice", "mdiFridgeOutline"], sink: ["Dřez", "mdiFaucet"],
  stove: ["Sporák", "mdiStove"], dishwasher: ["Myčka", "mdiDishwasher"], washer: ["Pračka", "mdiWashingMachine"],
  dryer: ["Sušička", "mdiTumbleDryer"], bathtub: ["Vana", "mdiBathtubOutline"], shower: ["Sprcha", "mdiShower"],
  washbasin: ["Umyvadlo", "mdiFaucet"], wc: ["WC", "mdiToilet"], radiator: ["Radiátor", "mdiRadiator"], robot_vacuum: ["Vysavač (dok)", "mdiRobotVacuum"],
};
const LIGHT_ICON = { lamp_spot: "mdiSpotlightBeam", lamp_table: "mdiLamp", lamp_wall: "mdiWallSconceFlat", led_strip: "mdiLedStripVariant" };
const lightIcon = (type) => LIGHT_ICON[type] || "mdiCeilingLight";
const ALARM_ICON = {
  disarmed: "mdiShieldOffOutline", armed_home: "mdiShieldHome", armed_away: "mdiShieldLock", armed_night: "mdiShieldMoon",
  armed_vacation: "mdiShieldAirplane", armed_custom_bypass: "mdiShieldOutline", arming: "mdiShieldSync", pending: "mdiShieldSync", triggered: "mdiBellRing",
};
const ICON_DEFAULT = {
  fan: "mdiFan", purifier: "mdiAirPurifier", dishwasher: "mdiDishwasher", dryer: "mdiTumbleDryer", radiator: "rBody", boiler: "mdiWaterBoiler",
  alarm: "mdiShieldOutline", media: "mdiCastVariant", generic: "mdiShapeOutline", lock: "mdiLock", aquarium: "mdiFishbowlOutline", camera: "mdiCctv",
  fridge: "mdiFridgeOutline", fireplace: "mdiFireplace",
};
// effects around (or inside) a device badge while it runs; `ring` is the plain expanding ring, the rest are drawn into `.fx`
const FX_SVG = (() => {
  const w = (a1, a2, R) => { const r = Math.PI / 180, f = (v) => v.toFixed(2); return `M0 0L${f(R * Math.cos(a1 * r))} ${f(R * Math.sin(a1 * r))}A${R} ${R} 0 0 1 ${f(R * Math.cos(a2 * r))} ${f(R * Math.sin(a2 * r))}Z`; };
  let trail = "";
  for (let i = 0; i < 12; i++) trail += `<path d="${w(-(i + 1) * 6, -i * 6, 16)}" opacity="${(0.55 * (1 - i / 12)).toFixed(2)}"/>`;
  // comet: arc segments along the badge rim, fading behind the head
  let tail = "";
  for (let i = 0; i < 14; i++) tail += `<path d="${w(-(i + 1) * 7, -i * 7, 17).replace(/^M0 0L/, "M")}" class="tail" opacity="${(1 - i / 14).toFixed(2)}"/>`;
  return {
    // the disc on top hides the beam behind the glyph (and its see-through parts), so the sweep only shows around it
    radar: `<g class="rot">${trail}<path d="M0 0H16" class="beam"/></g><circle r="10.5" class="mask"/>`,
    comet: `<g class="rot">${tail}<circle cx="17" r="2"/></g>`,
    spin: `<g class="rot"><circle r="22" class="dash"/></g>`,
    orbit: `<circle r="24" class="grid"/><g class="rot"><circle cx="24" r="3"/><circle cx="-24" r="2" opacity=".6"/></g>`,
    breath: `<circle r="19" class="halo"/>`,
    countdown: `<circle r="21" class="track"/><circle r="21" class="arc" transform="rotate(-90)"/>`,
    blink: `<circle r="17" class="flash"/>`,
  };
})();
const LOCK_ICON = { locked: "mdiLock", unlocked: "mdiLockOpenVariant", open: "mdiLockOpenVariant", jammed: "mdiLockAlert", locking: "mdiLockClock", unlocking: "mdiLockClock", opening: "mdiLockClock" };
const lockState = (s) => (s === "locked" ? "locked" : s === "jammed" ? "jammed" : s === "locking" || s === "unlocking" || s === "opening" ? "moving" : s === "unlocked" || s === "open" ? "unlocked" : "off");
const MEDIA_ICON = { tv: "mdiTelevision", speaker: "mdiSpeaker", receiver: "mdiAudioVideo" };

// floors: plan.levels [{id, name}]; a room or item without `level` belongs to the first one
const levelsOf = (plan) => (plan.levels?.length ? plan.levels : [{ id: "0", name: "Přízemí" }]);
const onLevel = (item, lvl, base) => String(item.level ?? base) === String(lvl);
// the part of the plan on one floor (openings follow their room, the robot its dock)
function planForLevel(plan, lvl) {
  const base = levelsOf(plan)[0].id;
  const pick = (k) => (plan[k] || []).filter((x) => onLevel(x, lvl, base));
  const rooms = pick("rooms"), ids = new Set(rooms.map((r) => r.id));
  return { ...plan, rooms, openings: (plan.openings || []).filter((o) => ids.has(o.room_id)), furniture: pick("furniture"),
    devices: pick("devices"), sensors: pick("sensors"), texts: pick("texts") };
}

// any HA icon ("mdi:…") as a path: from the bundled set, otherwise read from an offscreen <ha-icon>
const iconCache = new Map();
const deepPath = (node) => {
  const r = node.shadowRoot;
  if (!r) return null;
  const d = r.querySelector("path")?.getAttribute("d");
  if (d) return d;
  for (const c of r.querySelectorAll("*")) { const x = deepPath(c); if (x) return x; }
  return null;
};
function resolveIcon(name, stateObj, hass) {
  const key = name && "mdi" + name.slice(4).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  if (name?.startsWith("mdi:") && MDI[key]) return Promise.resolve(MDI[key]);
  const id = name || `state:${stateObj?.entity_id}:${stateObj?.state}`;
  if (!iconCache.has(id)) {
    iconCache.set(id, new Promise((done) => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:-100px;top:0;width:24px;height:24px;overflow:hidden;opacity:0;pointer-events:none";
      // without a name the entity's own icon (ha-state-icon knows the domain and device class defaults)
      const ic = document.createElement(name ? "ha-icon" : "ha-state-icon");
      if (name) ic.icon = name;
      else { ic.hass = hass; ic.stateObj = stateObj; }
      host.appendChild(ic);
      document.body.appendChild(host);
      let n = 0;
      const t = setInterval(() => {
        const d = deepPath(ic);
        if (d || ++n > 50) { clearInterval(t); host.remove(); done(d); if (!d) iconCache.delete(id); }
      }, 100);
    }));
  }
  return iconCache.get(id);
}
// an icon path centred on 0,0; a custom icon replaces the default one once it is loaded
const iconHtml = (icon, size, fallback, cls = "") =>
  icon === "none" ? `<path class="${cls}" d=""/>` : icon ? `<path class="${cls}" data-icon="${icon}" d="${MDI[fallback] || ""}" transform="translate(${-size / 2} ${-size / 2}) scale(${size / 24})"/>` : mdiPath(fallback, size, cls);
// a rule may swap an icon; without one the original comes back
function swapIcon(path, icon) {
  if (!path) return;
  path.dataset.orig ??= path.getAttribute("d");
  if ((path.dataset.cur || "") === (icon || "")) return;
  path.dataset.cur = icon || "";
  if (!icon) return path.setAttribute("d", path.dataset.orig);
  if (icon === "none") return path.setAttribute("d", "");
  resolveIcon(icon).then((d) => d && path.dataset.cur === icon && path.setAttribute("d", d));
}
const hydrate = (node) => node.querySelectorAll("[data-icon]").forEach((p) =>
  resolveIcon(p.dataset.icon).then((d) => d && p.setAttribute("d", d)));

// rules: an ordered list, each {if: [conditions], color, glow, animate, wave, text, tint, opacity, hide};
// for every field the first matching rule that sets it wins. A condition is
// {entity, attribute?, state | state_not | above | below}, {template: "{{ … }}"} (rendered by HA),
// or {any: [conditions]} for OR. `tpl` holds the latest result of every template.
const truthy = (v) => v === true || (typeof v === "number" && v !== 0) || ["true", "on", "yes", "1"].includes(String(v).trim().toLowerCase());
function condOk(c, states, tpl) {
  if (c.any) return c.any.some((x) => condOk(x, states, tpl));
  if (c.template) return truthy(tpl?.get(c.template));
  const s = states[c.entity];
  if (!s) return false;
  const v = c.attribute ? s.attributes[c.attribute] : s.state;
  if (c.state != null && ![].concat(c.state).map(String).includes(String(v))) return false;
  if (c.state_not != null && [].concat(c.state_not).map(String).includes(String(v))) return false;
  if (c.above != null && !(Number(v) > c.above)) return false;
  if (c.below != null && !(Number(v) < c.below)) return false;
  return true;
}
function evalRules(rules, states, tpl) {
  const out = {};
  for (const r of rules || []) {
    if (!(r.if ? [].concat(r.if) : []).every((c) => condOk(c, states, tpl))) continue;
    for (const [k, v] of Object.entries(r)) if (k !== "if" && !(k in out)) out[k] = v;
    // a countdown of a set length runs from when this rule's condition entities last changed
    if (r.progress_total && out._since == null) {
      const ids = [], walk = (c) => (c.any ? c.any.forEach(walk) : c.entity && ids.push(c.entity));
      [].concat(r.if || []).forEach(walk);
      out._since = Math.max(0, ...ids.map((id) => Date.parse(states[id]?.last_changed) || 0));
    }
  }
  return out;
}

// tap / double tap / hold, each an HA-style action {action: toggle | more-info | perform-action | navigate | url | none}
function runAction(card, a, entity) {
  const hass = card._hass;
  if (!a || a.action === "none") return;
  const ent = a.entity || entity;
  if (a.action === "toggle" && ent) hass.callService("homeassistant", "toggle", { entity_id: ent });
  else if (a.action === "more-info" && ent) card.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: ent }, bubbles: true, composed: true }));
  else if ((a.action === "perform-action" || a.action === "call-service") && (a.perform_action || a.service)) {
    const [domain, service] = (a.perform_action || a.service).split(".");
    hass.callService(domain, service, a.data || {}, a.target);
  } else if (a.action === "navigate" && a.navigation_path) {
    history.pushState(null, "", a.navigation_path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  } else if (a.action === "url" && a.url_path) window.open(a.url_path, "_blank", "noopener");
}
// what an action does, for the hover title
const ACTION_TEXT = { toggle: "přepnout", "more-info": "detail", "perform-action": "akce", "call-service": "akce", navigate: "otevřít stránku", url: "otevřít odkaz" };
const actionText = (a) => {
  const t = ACTION_TEXT[a?.action];
  if (!t) return "";
  if (t === "akce") return `akce ${a.perform_action || a.service || ""}`.trim();
  return a.action === "navigate" && a.navigation_path ? `${t} ${a.navigation_path}` : t;
};
// a tap waits for a possible second tap only when the item has a double tap action
function bindActions(card, node, item, defaults, entity = item.entity) {
  const pick = (k) => item[k + "_action"] || defaults[k];
  // hover title: the entity's name and what tap, double tap and hold do
  const parts = [["klepnutí", "tap"], ["dvojklik", "double_tap"], ["podržení", "hold"]]
    .map(([label, k]) => [label, actionText(pick(k))]).filter(([, t]) => t).map(([label, t]) => `${label}: ${t}`);
  const name = item.name || card._hass?.states[entity]?.attributes.friendly_name || entity || "";
  if (name || parts.length) {
    const title = document.createElementNS(NS, "title");
    title.textContent = [name, parts.join(" · ")].filter(Boolean).join(" – ");
    node.prepend(title);
  }
  let timer = 0, held = false, tapTimer = 0;
  node.addEventListener("pointerdown", () => {
    held = false;
    clearTimeout(timer);
    const hold = pick("hold");
    if (hold && hold.action !== "none") timer = setTimeout(() => { held = true; runAction(card, hold, entity); }, 500);
  });
  for (const ev of ["pointerup", "pointerleave", "pointercancel"]) node.addEventListener(ev, () => clearTimeout(timer));
  node.addEventListener("click", (e) => {
    e.stopPropagation();
    if (held) return;
    const dbl = pick("double_tap");
    if (!dbl || dbl.action === "none") return runAction(card, pick("tap"), entity);
    if (tapTimer) { clearTimeout(tapTimer); tapTimer = 0; runAction(card, dbl, entity); }
    else tapTimer = setTimeout(() => { tapTimer = 0; runAction(card, pick("tap"), entity); }, 250);
  });
  node.addEventListener("contextmenu", (e) => e.preventDefault());
}
const TOGGLE = { tap: { action: "toggle" }, hold: { action: "more-info" } };
const INFO = { tap: { action: "more-info" } };
// z-order inside one layer of the plan: a higher "layer" is drawn later, i.e. on top
const sortLayer = (g) => [...g.children].sort((a, b) => (a.dataset.layer || 0) - (b.dataset.layer || 0)).forEach((c) => g.appendChild(c));

const STYLE = `
:host { display: block; }
ha-card { overflow: hidden; background: none; border: 0; }
.app {
  --bg: #0a0e1c; --bg2: #10162b; --floor: #141b33; --floor-hi: #19223f;
  --wall: var(--primary-color, #8b93ff); --wall-glow: color-mix(in srgb, var(--primary-color, #6366f1) 55%, transparent);
  --text: #e8ebff; --badge-fg: #fff; --muted: #8d95c0; --chip: rgba(18, 24, 48, .78); --line: rgba(139, 147, 255, .22);
  --accent: var(--primary-color, #818cf8); --warm: #ffc46b; --open: #ffb02e; --alarm: #ff4d6d; --cold: #60a5fa; --hot: #fb923c;
  container-type: inline-size;
  position: relative; display: flex; flex-direction: column;
  border-radius: var(--ha-card-border-radius, 12px);
  background: color-mix(in srgb, var(--primary-color, #818cf8) 5%, transparent);
  color: var(--text); font: 14px/1.35 var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  transition: background .8s, color .8s; -webkit-tap-highlight-color: transparent;
}
.app[data-mode="day"] {
  --bg: #e9ecf8; --bg2: #f6f7fd; --floor: #ffffff; --floor-hi: #f3f4ff;
  --wall: var(--primary-color, #3f46c8); --wall-glow: color-mix(in srgb, var(--primary-color, #6366f1) 18%, transparent);
  --text: #1b1f3b; --badge-fg: #000; --muted: #5b638f; --chip: rgba(255, 255, 255, .86); --line: rgba(63, 70, 200, .16);
}
[hidden] { display: none !important; }
.legend { padding: 6px 12px 10px; font-size: 11px; color: var(--muted); }
.legend i { display: block; height: 8px; border-radius: 4px; border: 1px solid var(--line); }
.legend div { display: flex; justify-content: space-between; margin-top: 3px; }
.bar { display: flex; align-items: center; gap: 8px; padding: 8px 10px 6px; }
.bar .sp { flex: 1; }
.floors, .tools { display: flex; gap: 4px; padding: 3px; height: var(--ha-badge-size, 36px); box-sizing: border-box; align-items: center;
  border-radius: var(--ha-badge-border-radius, 18px); background: var(--ha-card-background, var(--card-background-color, #fff));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
  box-shadow: var(--ha-card-box-shadow, none); color: var(--primary-text-color); }
.floors button { border: 0; background: none; color: var(--secondary-text-color); font: 500 12px/1 inherit; font-family: inherit; padding: 6px 11px; border-radius: 99px; cursor: pointer; }
.tools button { display: flex; align-items: center; border: 0; background: none; color: var(--secondary-text-color); font: 500 12px/1 inherit; font-family: inherit; padding: 4px 10px; border-radius: 99px; cursor: pointer; }
.tools ha-icon { --mdc-icon-size: 18px; }
.floors button.on, .tools button.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
.heat { pointer-events: none; transition: opacity .6s, fill .6s; }
.replay { position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 3; display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 99px;
  background: var(--chip); border: 1px solid var(--line); color: var(--text); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.replay input { flex: 1; min-width: 0; }
.replay button { border: 0; background: none; color: var(--muted); font: 500 12px/1 inherit; font-family: inherit; padding: 6px 11px; border-radius: 99px; cursor: pointer; }
.replay .rp-time { font-size: 12px; white-space: nowrap; }
.stage { position: relative; border-radius: inherit; overflow: hidden; max-height: 85vh;
  background: linear-gradient(160deg, rgba(255,255,255,.025), rgba(255,255,255,0)); }
svg.plan { width: 100%; height: 100%; display: block; }
.room-floor { fill: var(--floor); transition: fill .8s; cursor: pointer; }
.room-floor:hover, .room-floor.sel { fill: var(--floor-hi); }
.walls { fill: none; stroke: var(--wall); stroke-width: 6; stroke-linejoin: round; transition: stroke .8s; }
.gwalls { filter: drop-shadow(0 0 3px var(--wall-glow)); }
.cut { stroke: var(--floor); stroke-width: 9; transition: stroke .8s; }
.door-arc { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 3 3; opacity: .7; }
.door-leaf { stroke: var(--muted); stroke-width: 2; stroke-linecap: round; }
.win { stroke: #67e8f9; stroke-width: 4; stroke-linecap: round; filter: drop-shadow(0 0 2px #67e8f9); }
.sash { stroke: #67e8f9; stroke-width: 2; stroke-linecap: round; }
.is-open .door-arc { opacity: .5; }
.alert-open.fresh .sash, .alert-open.fresh .door-leaf { animation: winPulse .8s ease-in-out infinite; }
.alert-open .door-leaf, .alert-open .sash { stroke: var(--open); filter: drop-shadow(0 0 3px var(--open)); }
.blind-track { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 2 3; opacity: .55; pointer-events: none; }
.blind { stroke: var(--muted); stroke-width: 5; stroke-linecap: butt; pointer-events: none; transition: x2 .6s, y2 .6s; }
.blind.open { visibility: hidden; }
.blind.moving { stroke: var(--accent); stroke-dasharray: 6 4; animation: blindMove .8s linear infinite; }
.strip { pointer-events: none; }
.strip-hit { stroke: transparent; stroke-width: 16; stroke-linecap: round; cursor: pointer; }
.open-hit { stroke: transparent; stroke-width: 16; cursor: pointer; }
.furn { fill: rgba(139,147,255,.05); stroke: rgba(139,147,255,.28); stroke-width: 1; pointer-events: none; }
.app[data-mode="day"] .furn { fill: rgba(63,70,200,.04); stroke: rgba(63,70,200,.25); }
/* crisp lines on a scaled-down plan: thin strokes stay 1 px on screen instead of a blurry half pixel */
.furn, .door-arc, .door-leaf, .sash, .label rect, .tv { vector-effect: non-scaling-stroke; }
svg.plan text { text-rendering: geometricPrecision; }
/* daylight: no glow halos around walls and windows, they only smudge the lines */
.app[data-mode="day"] .gwalls, .app[data-mode="day"] .win { filter: none; }
.glow { mix-blend-mode: screen; pointer-events: none; }
.app[data-mode="day"] .glow { mix-blend-mode: multiply; opacity: .35 !important; }
.lamp { cursor: pointer; --lamp: #ffd9a0; }
.lamp .hit { fill: transparent; }
.lamp circle.core { fill: var(--chip); stroke: rgba(139,147,255,.45); stroke-width: 1.2; transition: fill .4s, stroke .4s; }
.lamp .lamp-icon path { fill: var(--state-light-off-color, var(--state-icon-color, var(--muted))); transition: fill .4s; }
.lamp.on .lamp-icon path { fill: #2a1a00; }
.lamp circle.halo { fill: none; stroke: rgba(139,147,255,.35); stroke-width: 1.2; opacity: 0; transition: stroke .4s, opacity .4s; } /* off: one ring like other badges */
.lamp.on circle.core { fill: var(--lamp); stroke: #fff; filter: drop-shadow(0 0 3px var(--lamp)); }
.lamp .spot-dir { fill: var(--state-light-off-color, var(--state-icon-color, var(--muted))); }
.lamp.on .spot-dir { fill: var(--lamp); }
.lamp.on circle.halo { stroke: var(--lamp); stroke-width: 2; opacity: 1; animation: halo 3s ease-in-out infinite; }
.strip { stroke: #2a3156; stroke-width: 3.5; stroke-linecap: round; transition: stroke .4s; }
.strip.on { stroke: var(--lamp); filter: drop-shadow(0 0 4px var(--lamp)); }
.strip.ruled:not(.on) { stroke: var(--lamp); }
.lamp.ruled:not(.on) .lamp-icon path { fill: var(--lamp); }
.fxo { pointer-events: none; }
.app[data-mode="day"] .strip:not(.on) { stroke: #c9cdea; }
.dev { cursor: pointer; }
.dev .badge { fill: var(--chip); stroke: var(--line); stroke-width: 1.2; }
.dev .ring { fill: none; stroke: var(--accent); stroke-width: 2; opacity: 0; }
.dev .icon path { fill: var(--muted); stroke: none; transition: fill .4s; }
.dev .icon .waves path { fill: none; stroke: #67e8f9; stroke-width: 1.4; stroke-linecap: round; }
.dev .icon .flame { opacity: 0; }
.dev .icon .flame path { fill: #ff8a3d; }
.dev .devtext { fill: var(--text); font-size: 10.5px; font-weight: 500; }
.devtag rect { fill: var(--chip); stroke: var(--line); stroke-width: 1; }
.ficon path { fill: var(--muted); opacity: .38; }
.ficon { pointer-events: none; }
.act { cursor: pointer; }
.act .furn { pointer-events: auto; }
.dev .sound path { fill: none; stroke: var(--accent); stroke-width: 1.4; stroke-linecap: round; opacity: 0; }
.dev-media.on .sound path { animation: sound 1.4s ease-out infinite; }
.dev .cover { pointer-events: none; }
.dev.has-cover .glyph { opacity: 0; }
.dev-media.on .sound path:nth-child(even) { animation-delay: .35s; }
.dev-alarm[data-al="armed"] .icon path { fill: #4ade80 !important; }
.dev-alarm[data-al="armed"] .badge { stroke: #4ade80; }
.dev-alarm[data-al="pending"] .icon path { fill: var(--open) !important; }
.dev.dev-alarm.on[data-al="pending"] .badge, .dev.dev-alarm.on[data-al="pending"] .ring { stroke: var(--open); }
.dev-alarm[data-al="triggered"] .icon path { fill: var(--alarm) !important; }
.dev.dev-alarm.on[data-al="triggered"] .badge, .dev.dev-alarm.on[data-al="triggered"] .ring { stroke: var(--alarm); }
.dev-lock[data-lk="locked"] .icon path { fill: #4ade80 !important; }
.dev-lock[data-lk="unlocked"] .icon path { fill: var(--open) !important; }
.dev-lock[data-lk="unlocked"] .badge { stroke: var(--open); }
.dev-lock[data-lk="jammed"] .icon path { fill: var(--alarm) !important; }
.dev.dev-lock.on[data-lk="jammed"] .badge, .dev.dev-lock.on[data-lk="jammed"] .ring { stroke: var(--alarm); }
.dev-lock[data-lk="moving"] .icon path { fill: var(--open) !important; }
.dev.dev-lock.on[data-lk="moving"] .badge, .dev.dev-lock.on[data-lk="moving"] .ring { stroke: var(--open); }
.dev-lock[data-lk="moving"] .fx { color: var(--open); }
.alarm-fx { fill: transparent; pointer-events: none; fill-rule: nonzero; }
.alarm-fx.triggered { fill: var(--alarm); animation: alarmPulse 1s ease-in-out infinite; }
.dev .fx { color: var(--accent); opacity: 0; pointer-events: none; }
.dev.on .fx { opacity: 1; }
.dev.themed .fx, .dev.ruled .fx { color: var(--dev); }
.dev-alarm[data-al="pending"] .fx { color: var(--open); }
.dev-alarm[data-al="triggered"] .fx, .dev-lock[data-lk="jammed"] .fx { color: var(--alarm); }
.dev:not([data-fx="ring"]) .ring { visibility: hidden; }
.dev .fx path, .dev .fx circle { fill: currentColor; }
.dev .fx path.tail { fill: none; stroke: currentColor; stroke-width: 2.6; }
.dev .fx .halo { fill: none; stroke: currentColor; }
.dev .fx .beam { stroke: currentColor; stroke-width: 1; }
.dev .fx .mask { fill: var(--chip); }
.dev .fx .grid { fill: none; stroke: currentColor; stroke-opacity: .25; stroke-width: .7; }
.dev .fx .dash { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-dasharray: 14 9; stroke-linecap: round; }
.dev .fx .track { fill: none; stroke: currentColor; stroke-opacity: .2; stroke-width: 3; }
.dev .fx .arc { fill: none; stroke: currentColor; stroke-width: 3; stroke-dasharray: 132; }
.dev .fx .flash { fill: currentColor; opacity: 0; }
.dev .fx .rot { transform-origin: 0 0; }
.dev.on[data-fx="radar"] .fx .rot { animation: spin 4.5s linear infinite; }
.dev.on[data-fx="spin"] .fx .rot, .dev.on[data-fx="comet"] .fx .rot, .dev.on[data-fx="orbit"] .fx .rot { animation: spin 2.4s linear infinite; }
.dev.on[data-fx="breath"] .fx .halo { animation: fxBreath 2.2s ease-in-out infinite; }
.dev.on[data-fx="countdown"] .fx .arc { animation: fxCount 4s linear infinite; }
.dev.on.prog[data-fx="countdown"] .fx .arc { animation: none; transition: stroke-dashoffset 1s; }
.dev.on[data-fx="blink"] .fx .flash { animation: fxBlink .9s ease-in-out infinite; }
.dev.on[data-fx="heartbeat"] > :not(.devtag) { transform-origin: 0 0; animation: fxBeat 1.2s ease-in-out infinite; }
.dev.on[data-fx="shake"] .icon { transform-origin: 0 0; animation: fxShake .6s ease-in-out infinite; }
.alarm-fx.pending { fill: var(--open); animation: alarmPulse 2s ease-in-out infinite; }
.dev.on .badge { stroke: var(--accent); }
.dev.on .ring { animation: devRing 2.4s ease-out infinite; }
.dev.pressed .ring { animation: devRing 1.2s ease-out 2; }
.dev:not(.on).has-cover .cover { opacity: .45; filter: grayscale(1); }
.dev.on .icon > path, .dev.on .icon .spin path, .dev.on .icon .wobble path { fill: #c7d2fe; }
.app[data-mode="day"] .dev.on .icon > path, .app[data-mode="day"] .dev.on .icon .spin path, .app[data-mode="day"] .dev.on .icon .wobble path { fill: var(--accent); }
.dev .spin, .dev .wobble { transform-box: fill-box; transform-origin: center; }
.dev .waves { opacity: 0; }
/* dryer and dishwasher as on the old picture-elements plan: yellow, shaking (dishwasher bouncing), the drum / wash window flickering */
.dev-dryer.on .icon .glyph, .dev-dishwasher.on .icon .glyph { fill: #ffc107 !important; }
.dev.dev-dryer.on:not(.ruled) .fx, .dev.dev-dishwasher.on:not(.ruled) .fx { color: #ffc107; }
.dev.dev-dryer.on:not(.ruled) .ring, .dev.dev-dishwasher.on:not(.ruled) .ring { stroke: #ffc107; }
.dev-dryer.on .wobble { transform-origin: 50% 65%; animation: tdShake .4s ease-in-out infinite; }
.dev-dishwasher.on .wobble { transform-origin: 50% 75%; animation: dwBounce 1.5s ease-in-out infinite; }
.dev-dryer.on .glyph, .dev-dishwasher.on .glyph { animation: drum 1s ease-in-out infinite; }
.dev.themed .icon .glyph { fill: var(--dev) !important; }
.dev.themed.on .badge { stroke: var(--dev); }
.dev.on.themed .ring, .dev.on.ruled .ring { stroke: var(--dev); }
.dev.unavail { opacity: .55; }
/* coloured badge only while running; idle locks and alarms keep the plain grey badge */
.dev.themed:not(.on) .badge { stroke: var(--line); }
.dev.dev-dishwasher.err .icon .glyph { fill: var(--alarm) !important; }
.dev-fan.on .spin { animation: spin .7s linear infinite; }
.dev-purifier.on .waves { animation: waves 2s ease-out infinite; }
.dev .bubbles circle { fill: none; stroke: #67e8f9; stroke-width: .8; opacity: 0; }
.dev-aquarium.on .bubbles circle { animation: bubble 1.8s ease-in infinite; }
.dev-aquarium.on .bubbles circle:nth-child(2) { animation-delay: .6s; }
.dev-aquarium.on .bubbles circle:nth-child(3) { animation-delay: 1.2s; }
.dev-boiler.on .flame, .dev-fireplace.on .flame { opacity: 1; filter: drop-shadow(0 0 2px #ff8a3d); }
.dev-fireplace.on .badge, .dev-fireplace.on .ring { stroke: #ff8a3d; }
.dev-boiler.on .flame path, .dev-fireplace.on .flame path { transform-box: fill-box; transform-origin: 50% 100%; animation: flame .5s ease-in-out infinite alternate; }
.dev-boiler.on .badge, .dev-boiler.on .ring { stroke: #ff8a3d; }
.dev .heatwaves g { opacity: 0; }
.dev-radiator.on .heatwaves path { fill: var(--wave, #ef4444) !important; }
.dev-radiator.on .heatwaves g { animation: heatwave 1.6s ease-in-out infinite; }
.dev-radiator.on .heatwaves g:nth-child(2) { animation-delay: .35s; }
.dev-radiator.on .heatwaves g:nth-child(3) { animation-delay: .7s; }
.dev-radiator.on .ring { stroke: var(--wave, #ef4444); }
/* icon animations by icon name (Mushroom style), only while running */
.dev .icon { transform-box: fill-box; transform-origin: center; }
.dev.on[data-anim="spin"] .icon { animation: spin 1s linear infinite; }
.dev.on[data-anim="shake"] .icon { transform-origin: 50% 90%; animation: iaShake .4s ease-in-out infinite; }
.dev.on[data-anim="bounce"] .icon { transform-origin: 50% 75%; animation: dwBounce 1.5s ease-in-out infinite; }
.dev.on[data-anim="flame"] .icon { transform-origin: 50% 85%; animation: iaFlame .8s ease-in-out infinite alternate; }
.dev.on[data-anim="cool"] .icon { animation: iaCool 6s ease-in-out infinite; }
.dev.on[data-anim="beat"] .icon { transform-origin: 50% 60%; animation: iaBeat 1.3s ease-out infinite both; }
.dev.on[data-anim="flicker"] .icon { animation: iaFlicker 1s linear infinite alternate; }
/* garage door and window shutter: only the slats roll up, the frame stays (MDI icon layouts) */
.dev.on[data-anim="garage"] .icon { animation: iaGarage 2.4s steps(1) infinite; }
.dev.on[data-anim="shutter"] .icon { animation: iaShutter 3s steps(1) infinite; }
.dev.on[data-anim="ring"] .icon { transform-origin: 50% 15%; animation: iaRing 2s ease-in-out infinite; }
.dev.on[data-anim="open"] .icon { transform-origin: 30% 50%; animation: iaOpen 6s ease-in-out infinite; }
.dev.on[data-anim="drive"] .icon { animation: iaDrive 4s ease-in-out infinite; }
.dev.on[data-anim="scan"] .icon { transform-origin: 90% 80%; animation: iaScan 5s ease-in-out infinite; }
/* steam rises from the pot / spout and drifts off; the pot and kettle stay whole */
.dev.on[data-anim="steam"] .icon { animation: iaSteam 2.4s ease-in-out infinite; }
.dev.on[data-anim="kettle"] .icon { animation: iaKettle 2.4s ease-in-out infinite; }
.dev.on[data-anim="drip"] .icon { animation: iaDrip 1.6s ease-in-out infinite; }
/* wifi and access point: the arcs light up from the source outwards, the source itself always shows */
.dev.on[data-anim="wifi"] .icon { animation: iaWifi 2.4s steps(1) infinite; }
.dev.on[data-anim="ap"] .icon { animation: iaAp 2.4s steps(1) infinite; }
/* account with a badge: only the badge in the corner blinks */
.dev.on[data-anim="badge"] .icon { animation: iaBadge 1.4s steps(1) infinite; }
.dev.on[data-anim="pulse"] .icon { animation: iaPulse 2s ease-in-out infinite; }
.dev.on[data-anim="lid"] .icon { transform-origin: 50% 25%; animation: iaLid 1.5s ease infinite; }
.dev.on[data-anim="flip"] .icon { animation: iaFlip 4s ease-in-out infinite; }
/* charging: only the inside of the battery fills up bar by bar; the frame and bolt stay (MDI battery-charging-* layout,
   clipped with an evenodd path in the icon's own units: a polygon hole would need a seam that shows as a hairline) */
.dev.on[data-anim="charge"] .icon { animation: iaCharge 2.4s steps(1) infinite; }
.dev.on[data-anim="breathe"] .icon { transform-origin: 50% 100%; animation: iaBreathe 4s ease-in-out infinite; }
.dev.on[data-anim="rock"] .icon { transform-origin: 50% 100%; animation: iaRock 2s ease-in-out infinite; }
.dev.on[data-anim="breeze"] .icon { transform-origin: 50% 100%; animation: iaBreeze 3.5s ease-in-out infinite; }
.dev.on[data-anim="heat"] .icon { animation: iaHeat .9s linear infinite; }
.dev.on[data-anim="led"] .icon { animation: iaLed 1.2s steps(1) infinite; }
.dev.on[data-anim="curtain"] .icon { animation: iaCurtain 3s ease-in-out infinite; }
.dev.on[data-anim="arrow"] .icon { animation: iaArrow 1.4s ease-in infinite; }
.dev.on[data-anim="arrowup"] .icon { animation: iaArrow 1.4s ease-out infinite reverse; }
.dev.on[data-anim="boing"] .icon { transform-origin: 50% 90%; animation: iaBoing 3s ease infinite; }
.dev.on[data-anim="hop"] .icon { animation: iaHop 2s ease-in-out infinite; }
.dev.on[data-anim="wink"] .icon { animation: iaWink 4s ease-in-out infinite; }
.dev.ruled .icon path:not(.heatwaves path) { fill: var(--dev) !important; }
.dev.ruled .icon .bubbles circle, .dev.ruled .icon .sound path { stroke: var(--dev); }
.dev.ruled .badge { stroke: var(--dev); }
.dev.glow .badge { filter: drop-shadow(0 0 3px var(--dev)) drop-shadow(0 0 9px var(--dev)); }
.furn.ruled, .app[data-mode="day"] .furn.ruled { fill: var(--furn); fill-opacity: .6; stroke: var(--furn); stroke-opacity: .9; }
/* glow: two shadows, sized in screen pixels so it stays visible on a scaled-down plan */
.furn.glow { filter: drop-shadow(0 0 3px var(--furn)) drop-shadow(0 0 9px var(--furn)); }
.app[data-mode="day"] .furn.glow { filter: drop-shadow(0 0 2px var(--furn)) drop-shadow(0 0 7px var(--furn)) drop-shadow(0 0 7px var(--furn)); }
.tint { pointer-events: none; transition: fill .6s, opacity .6s; }
.tint.glow { filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 12px currentColor); }
.label { pointer-events: none; }
.label rect { fill: var(--chip); stroke: var(--line); }
.tlabel text { fill: var(--text); font-size: 10.5px; font-weight: 500; }
.tlabel rect { fill: var(--chip); stroke: var(--line); }
.tlabel { pointer-events: none; }
.tlabel.act { pointer-events: auto; }
.label .name { fill: var(--text); font-weight: 600; font-size: 12px; }
.label .clim { font-size: 10.5px; font-weight: 500; }
.t-cold { fill: var(--cold); } .t-ok { fill: var(--badge-fg); } .t-hot { fill: var(--hot); }
.ripple { fill: none; stroke: var(--accent); stroke-width: 2; animation: ripple 2.4s cubic-bezier(.2,.6,.4,1) infinite; opacity: 0; pointer-events: none; }
.ripple.r2 { animation-delay: -.8s; } .ripple.r3 { animation-delay: -1.6s; }
.leak { fill: var(--alarm); opacity: 0; animation: leak 1.2s ease-in-out infinite; pointer-events: none; }
.tv { fill: #05070f; stroke: rgba(139,147,255,.6); stroke-width: 1; }
.tv.playing { animation: tvHue 4s linear infinite; }
.robot { cursor: pointer; }
.robot .rbadge { fill: var(--chip); stroke: var(--line); stroke-width: 2; }
.robot { --rob: var(--state-vacuum-active-color, var(--state-active-color, var(--accent))); }
.robot.on .rbadge, .robot.ruled .rbadge, .robot.err .rbadge, .robot.stopped .rbadge { stroke: var(--rob); }
.robot.ruled .ricon path { fill: var(--rob); }
.robot .ricon path { fill: var(--rob, var(--muted)); }
.robot.on .ricon path { fill: var(--rob); } /* active colour of the theme, as other running badges (the old pale lilac was meant for night only) */
.trail { fill: none; stroke: var(--accent); stroke-width: 16; stroke-linecap: round; stroke-linejoin: round; opacity: .1; pointer-events: none; }
.sheet {
  position: absolute; right: 12px; top: 12px; bottom: 12px; width: 290px; z-index: 2;
  background: var(--chip); border: 1px solid var(--line); border-radius: 16px;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: 14px; transform: translateX(120%);
  transition: transform .45s cubic-bezier(.2,.9,.3,1); overflow: auto;
}
.sheet.open { transform: none; }
.sheet h2 { margin: 0 0 2px; font-size: 18px; }
.sheet .sub { color: var(--muted); margin-bottom: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-top: 1px solid var(--line); gap: 10px; }
.row.link, .link { cursor: pointer; }
/* straight separators: a rounded hover row bent the line at its ends */
.row.link { margin: 0 -8px; padding-left: 8px; padding-right: 8px; transition: background .15s; }
.row ha-switch { flex: none; }
.row.link:hover { background: rgba(139, 147, 255, .1); }
.row .st { color: var(--muted); }
.row .st.open { color: var(--open); }
.sw { width: 44px; height: 26px; border-radius: 99px; background: #2a3156; position: relative; cursor: pointer; transition: background .3s; flex: none; border: 0; }
.sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .3s; }
.sw.on { background: var(--warm); }
.sw.on::after { transform: translateX(18px); }
.close { position: absolute; right: 10px; top: 10px; background: none; border: 0; color: var(--muted); font-size: 20px; cursor: pointer; }
.hint { color: var(--muted); font-size: 12px; }
.msg { padding: 16px; }
@container (max-width: 600px) {
  .sheet { left: 8px; right: 8px; top: auto; width: auto; max-height: 60%; bottom: 8px; transform: translateY(120%); }
}
@keyframes heatwave { 0%, 100% { opacity: .45; transform: translateY(1px); } 50% { opacity: 1; transform: translateY(-1.4px); } }
@keyframes halo { 50% { opacity: .55; } }
@keyframes tdShake { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(-4deg); } }
@keyframes dwBounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-1.2px) rotate(5deg); } 60% { transform: translateY(-1.1px) rotate(-4deg); } }
@keyframes drum { 50% { clip-path: polygon(0 0, 0 100%, 35% 100%, 36% 74%, 31% 43%, 61% 40%, 71% 69%, 62% 78%, 36% 73%, 35% 100%, 100% 100%, 100% 0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes devRing { from { r: 17; opacity: .7; } to { r: 30; opacity: 0; } }
@keyframes waves { 0% { opacity: 0; transform: translateY(3px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-3px); } }
@keyframes flame { from { transform: scale(.88, .8); } to { transform: scale(1.05, 1.12); } }
@keyframes ripple { 0% { r: 6; opacity: 0; } 15% { opacity: .75; } 100% { r: 70; opacity: 0; } }
@keyframes winPulse { 50% { opacity: .45; } }
@keyframes leak { 50% { opacity: .22; } }
@keyframes alarmPulse { 0%, 100% { opacity: .04; } 50% { opacity: .28; } }
@keyframes blindMove { to { stroke-dashoffset: -10; } }
@keyframes bubble { 0% { opacity: 0; transform: translateY(3px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-7px); } }
@keyframes sound { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
@keyframes blink { 50% { opacity: .3; } }
@keyframes fxCount { to { stroke-dashoffset: 132; } }
@keyframes fxBreath { 0%, 100% { stroke-width: 2; opacity: .25; } 50% { stroke-width: 7; opacity: .7; } }
@keyframes fxBlink { 50% { opacity: .55; } }
@keyframes fxBeat { 0%, 40%, 100% { transform: scale(1); } 10%, 30% { transform: scale(1.18); } 20% { transform: scale(1.04); } }
@keyframes fxShake { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-14deg); } 40% { transform: rotate(12deg); } 60% { transform: rotate(-8deg); } 80% { transform: rotate(5deg); } }
@keyframes tvHue { 0% { fill: #3b2bff; } 33% { fill: #ff2bd1; } 66% { fill: #2bd9ff; } 100% { fill: #3b2bff; } }
@keyframes iaShake { 0%, 100% { transform: translate(0, 0) rotate(0); } 20% { transform: translate(.4px, -.4px) rotate(-4deg); } 40% { transform: translate(-.4px, .4px) rotate(4deg); } 60% { transform: translate(.4px, .4px) rotate(-4deg); } 80% { transform: translate(-.4px, -.4px) rotate(4deg); } }
@keyframes iaFlame { 0% { transform: scale(1, .92) rotate(-2deg); opacity: .8; } 50% { transform: scale(.97, 1.1) rotate(2deg); opacity: 1; } 100% { transform: scale(1.02, .96) rotate(-1deg); opacity: .9; } }
@keyframes iaCool { 0%, 100% { transform: rotate(25deg); } 25% { transform: rotate(-25deg); } 50% { transform: rotate(50deg); } 75% { transform: rotate(-50deg); } }
@keyframes iaBeat { 0% { transform: scale(1); } 10% { transform: scale(1.1); } 17% { transform: scale(1.05); } 33% { transform: scale(1.25); } 60%, 100% { transform: scale(1); } }
@keyframes iaFlicker { 0%, 31.98%, 32.98%, 34.98%, 36.98%, 39.98%, 67.98%, 68.98%, 95.98%, 96.98%, 97.98%, 98.98%, 100% { opacity: .6; } 32%, 33%, 35%, 36%, 37%, 40%, 68%, 69%, 96%, 97%, 98%, 99% { opacity: 1; } }
@keyframes iaRing { 0%, 100% { transform: rotate(0); } 10% { transform: rotate(30deg); } 20% { transform: rotate(-28deg); } 30% { transform: rotate(22deg); } 40% { transform: rotate(-16deg); } 50% { transform: rotate(9deg); } 60% { transform: rotate(-4deg); } 70% { transform: rotate(0); } }
@keyframes iaOpen { 0%, 66%, 100% { transform: scaleX(1); } 33% { transform: scaleX(.35); } }
@keyframes iaDrive { 0%, 100% { transform: translateX(-3px); } 45% { transform: translateX(3px); } 50% { transform: translateX(3px) scaleX(-1); } 95% { transform: translateX(-3px) scaleX(-1); } }
@keyframes iaScan { 0%, 100% { transform: rotate(20deg); } 50% { transform: rotate(-15deg); } }
@keyframes iaDrip { 0%, 100% { transform: translateY(-1px); } 50% { transform: translateY(1.5px); } }
@keyframes iaWifi { 0% { clip-path: circle(33% at 50% 100%); } 30% { clip-path: circle(63% at 50% 100%); } 60%, 100% { clip-path: circle(100% at 50% 100%); } }
@keyframes iaAp { 0% { clip-path: circle(15% at 50% 50%); } 30% { clip-path: circle(38% at 50% 50%); } 60%, 100% { clip-path: circle(75% at 50% 50%); } }
@keyframes iaBadge { 0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%, 0 100%); } 50%, 100% { clip-path: polygon(0 0, 100% 0, 100% 63%, 63% 63%, 63% 100%, 0 100%); } }
@keyframes iaGarage { 0% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 85.5% 100%, 85.5% 100%, 14.5% 100%, 14.5% 100%, 0% 100%); } 25% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 85.5% 100%, 85.5% 84%, 14.5% 84%, 14.5% 100%, 0% 100%); } 50% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 85.5% 100%, 85.5% 64%, 14.5% 64%, 14.5% 100%, 0% 100%); } 75%, 100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 85.5% 100%, 85.5% 44%, 14.5% 44%, 14.5% 100%, 0% 100%); } }
@keyframes iaShutter { 0% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 77% 100%, 77% 100%, 23% 100%, 23% 100%, 0% 100%); } 19% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 77% 100%, 77% 85%, 23% 85%, 23% 100%, 0% 100%); } 38% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 77% 100%, 77% 66%, 23% 66%, 23% 100%, 0% 100%); } 56% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 77% 100%, 77% 47%, 23% 47%, 23% 100%, 0% 100%); } 75%, 100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 77% 100%, 77% 29%, 23% 29%, 23% 100%, 0% 100%); } }
@keyframes iaSteam { 0% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 50% 0%, 50% 0%, 0% 0%, 0% 38%, 50% 38%, 50% 38%, 100% 38%, 100% 100%, 0% 100%); } 45% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 50% 0%, 50% 0%, 0% 0%, 0% 0%, 50% 0%, 50% 0%, 100% 0%, 100% 100%, 0% 100%); } 50% { clip-path: polygon(0% 0%, 100% 0%, 100% 38%, 50% 38%, 50% 38%, 0% 38%, 0% 38%, 50% 38%, 50% 38%, 100% 38%, 100% 100%, 0% 100%); } 95%, 100% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 50% 0%, 50% 0%, 0% 0%, 0% 38%, 50% 38%, 50% 38%, 100% 38%, 100% 100%, 0% 100%); } }
@keyframes iaKettle { 0% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 82% 0%, 82% 0%, 70% 0%, 70% 35.5%, 82% 35.5%, 82% 47%, 100% 47%, 100% 100%, 0% 100%); } 45% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 82% 0%, 82% 0%, 70% 0%, 70% 0%, 82% 0%, 82% 0%, 100% 0%, 100% 100%, 0% 100%); } 50% { clip-path: polygon(0% 0%, 100% 0%, 100% 47%, 82% 47%, 82% 35.5%, 70% 35.5%, 70% 35.5%, 82% 35.5%, 82% 47%, 100% 47%, 100% 100%, 0% 100%); } 95%, 100% { clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 82% 0%, 82% 0%, 70% 0%, 70% 35.5%, 82% 35.5%, 82% 47%, 100% 47%, 100% 100%, 0% 100%); } }
@keyframes iaPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: .75; } }
@keyframes iaLid { 0%, 50%, 80%, 100% { transform: translateY(0); } 10% { transform: translateY(-2px) rotate(-20deg); } 20% { transform: translateY(-2px) rotate(16deg); } 30% { transform: translateY(-2px) rotate(-12deg); } 40% { transform: translateY(-2px) rotate(8deg); } 60% { transform: translateY(-1px); } }
@keyframes iaFlip { 0%, 40% { transform: rotate(0); } 50%, 90% { transform: rotate(180deg); } 100% { transform: rotate(360deg); } }
@keyframes iaCharge { 0% { clip-path: path(evenodd, "M-5 -5H30V30H-5Z M1.33 2.92H8.67V15.42H1.33Z"); } 25% { clip-path: path(evenodd, "M-5 -5H30V30H-5Z M1.33 2.92H8.67V11.25H1.33Z"); } 50% { clip-path: path(evenodd, "M-5 -5H30V30H-5Z M1.33 2.92H8.67V7.50H1.33Z"); } 75%, 100% { clip-path: path(evenodd, "M-5 -5H30V30H-5Z M1.33 2.92H8.67V2.92H1.33Z"); } }
@keyframes iaBreathe { 50% { transform: scale(1.04, 1.08); } }
@keyframes iaRock { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes iaBreeze { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(6deg); } 35% { transform: rotate(-3deg); } 55% { transform: rotate(9deg); } 75% { transform: rotate(-4deg); } }
@keyframes iaHeat { 0%, 100% { transform: translateY(0); opacity: 1; } 25% { transform: translateY(-.6px); opacity: .8; } 50% { transform: translateY(.3px); opacity: 1; } 75% { transform: translateY(-.4px); opacity: .85; } }
@keyframes iaLed { 0%, 30%, 60%, 100% { opacity: 1; } 20% { opacity: .55; } 55% { opacity: .5; } 85% { opacity: .6; } }
@keyframes iaCurtain { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(.6); } }
@keyframes iaArrow { 0% { transform: translateY(-3px); opacity: 0; } 30% { opacity: 1; } 70% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(2px); opacity: 0; } }
@keyframes iaBoing { 0%, 25%, 100% { transform: scale(1, 1); } 7% { transform: scale(1.25, .75); } 10% { transform: scale(.75, 1.25); } 12% { transform: scale(1.15, .85); } 16% { transform: scale(.95, 1.05); } 19% { transform: scale(1.05, .95); } }
@keyframes iaHop { 0%, 40%, 100% { transform: translateY(0); } 10% { transform: translateY(-3px); } 20% { transform: translateY(0); } 28% { transform: translateY(-2px); } }
@keyframes iaWink { 0%, 44%, 52%, 100% { transform: scaleY(1); } 48% { transform: scaleY(.1); } }
@media (prefers-reduced-motion: reduce) { .ripple, .alert-open.fresh *, .leak, .alarm-fx, .tv.playing, .dev *, .lamp * { animation: none !important; } }
`;

// HA's state colour for an entity, as the frontend picks it: device class + state, state, then active (idle: icon colour)
const cssName = (v) => /^[a-z0-9_]+$/.test(v || "");
function themeColor(entity, s, on) {
  const domain = entity.split(".")[0], state = s?.state, dc = s?.attributes.device_class;
  if (!s || state === "unavailable" || state === "unknown") return "var(--state-unavailable-color, var(--disabled-text-color, #9e9e9e))";
  // idle: the theme's plain icon colour (as HA draws off entities), unless the theme colours that exact state
  let c = on ? "var(--state-active-color, var(--accent))" : "var(--state-icon-color, var(--muted))";
  if (!cssName(domain)) return c;
  if (on) c = `var(--state-${domain}-active-color, ${c})`;
  if (cssName(state)) c = `var(--state-${domain}-${state}-color, ${c})`;
  if (cssName(state) && cssName(dc)) c = `var(--state-${domain}-${dc}-${state}-color, ${c})`;
  return c;
}

// appliance glyphs: an MDI icon plus the bits that animate; m(fallback) is the main icon (a custom one if set)
const ICON = {
  fan: (m) => `<g class="spin">${m("mdiFan")}</g>`,
  purifier: (m) => `${m("mdiAirPurifier")}<g class="waves"><path d="M-9 -13 Q0 -17 9 -13"/><path d="M-11 -16 Q0 -21 11 -16"/></g>`,
  dishwasher: (m) => `<g class="wobble">${m("mdiDishwasher")}</g>`,
  dryer: (m) => `<g class="wobble">${m("mdiTumbleDryer")}</g>`,
  radiator: (m) => `<g class="heatwaves">${["rWave1", "rWave2", "rWave3"].map((n) => `<g>${mdiPath(n, 20)}</g>`).join("")}</g>${m("rBody")}`,
  boiler: (m) => m("mdiWaterBoiler"),
  alarm: (m) => m("mdiShieldOutline", "glyph"),
  media: (m) => `<g class="sound"><path d="M12 -6 Q15.5 0 12 6"/><path d="M14.5 -9.5 Q19.5 0 14.5 9.5"/><path d="M-12 -6 Q-15.5 0 -12 6"/><path d="M-14.5 -9.5 Q-19.5 0 -14.5 9.5"/></g>${m("mdiCastVariant", "glyph")}`,
  generic: (m) => m("mdiShapeOutline", "glyph"),
  lock: (m) => m("mdiLock", "glyph"),
  aquarium: (m) => `${m("mdiFishbowlOutline")}<g class="bubbles"><circle cx="-3" cy="2" r="1.2"/><circle cx="2" cy="4" r="1"/><circle cx="4" cy="0" r="1.3"/></g>`,
  camera: (m) => m("mdiCctv"),
  fridge: (m) => m("mdiFridgeOutline"),
  // the fireplace's own flame (second part of the MDI path) is drawn apart so it alone flickers and hides when off
  fireplace: (m) => {
    const html = m("mdiFireplace"), at = MDI.mdiFireplace.indexOf("M14.5,14.67");
    if (!html.includes(MDI.mdiFireplace) || html.includes("data-icon")) return html; // a custom icon: no flame of its own to animate
    // the transform sits on the group: the flicker animation sets the path's own transform
    const t = html.match(/transform="([^"]*)"/)?.[1] || "";
    return html.replace(MDI.mdiFireplace, MDI.mdiFireplace.slice(0, at)) + `<g class="flame" transform="${t}"><path d="${MDI.mdiFireplace.slice(at)}"/></g>`;
  },
};

// Mushroom-style icon animations (card_mod guides by rhysb): a running item whose icon matches gets data-anim;
// kinds with their own animated glyph keep theirs
const OWN_ANIM = new Set(["fan", "purifier", "dishwasher", "dryer", "radiator", "boiler", "media", "aquarium", "fireplace"]);
const ICON_ANIM = [
  [/timer/, "flip"],
  [/battery-charging-(\d+|high|medium|low|outline)$/, "charge"],
  [/\bbed\b|sleep/, "breathe"],
  [/cradle|baby-carriage|rocking-chair/, "rock"],
  [/flower|leaf|sprout|\btree\b|plant/, "breeze"],
  [/stove|toaster|microwave|\biron\b/, "heat"],
  [/server|\bnas\b|router-network/, "led"],
  [/curtains|blinds-open/, "curtain"],
  [/download/, "arrow"],
  [/upload/, "arrowup"],
  [/fan|heat-pump|hurricane|cog|autorenew|movie-roll|turbine|sync|refresh|update/, "spin"],
  [/washing-machine|tumble-dryer|blender/, "shake"],
  [/dishwasher/, "bounce"],
  [/fire|candle|radiator|heat-wave/, "flame"],
  [/snowflake|air-conditioner/, "cool"],
  [/speaker|music|radio|volume-high|heart|microphone|headphones/, "beat"],
  [/television|monitor|projector/, "flicker"],
  [/garage(-variant)?$/, "garage"],
  [/window-shutter$/, "shutter"],
  [/doorbell|bell|phone|siren|alarm-light|alarm/, "ring"],
  [/door|gate|window-open/, "open"],
  [/robot-vacuum|robot-mower|mower|\bcar\b|truck|\bvan\b|motorbike|scooter|bicycle/, "drive"],
  [/email|mailbox|package/, "boing"],
  [/account-badge/, "badge"],
  [/account|human/, "boing"],
  [/\bdog\b|\bcat\b|\bpaw\b/, "hop"],
  [/\beye\b/, "wink"],
  [/cctv|camera|webcam/, "scan"],
  [/kettle-steam/, "kettle"],
  [/pot-steam/, "steam"],
  [/kettle|coffee|air-humidifier|diffuser/, "heat"],
  [/water-boiler|water-heater/, ""],
  [/water-alert|leak|pipe-leak/, "pulse"],
  [/shower|sprinkler|water|faucet|pump|fountain|hot-tub|pool/, "drip"],
  [/wifi$/, "wifi"],
  [/access-point$/, "ap"],
  [/router/, "led"],
  [/trash-can|delete/, "lid"],
  [/printer|wrench|tools|saw|drill|gamepad|controller/, "shake"],
  [/lightbulb|lamp|light|led|power|plug|socket|lightning|flash|battery|thermometer|ev-charger|ev-station|shield|motion|run|walk/, "pulse"],
];
// entity's default icon is unknown in JS (ha-state-icon): fall back to the domain
const DOMAIN_ANIM = { fan: "spin", vacuum: "drive", lawn_mower: "drive", siren: "ring", media_player: "beat", camera: "scan", humidifier: "steam", light: "pulse" };
function iconAnim(icon, entity) {
  // "…-off" icons (fan-off, lightbulb-off) show something that is not running
  if (icon === "none" || /-off(-|$)/.test(icon)) return "";
  if (icon) return ICON_ANIM.find(([re]) => re.test(icon))?.[1] || "";
  return DOMAIN_ANIM[String(entity || "").split(".")[0]] || "";
}

// default behaviour of a generic item by its entity's domain: on(state), text(state, on), fx (key or fn of state),
// tap(entity) action, press (state is a time of the last run: the ring beeps on change), cover (entity_picture in the badge)
const numAttr = (s, k) => { const v = k ? s.attributes[k] : s.state; return v == null || v === "" || isNaN(Number(v)) ? null : Number(v); };
const fmt = (v, u = "") => v == null ? "" : `${Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}${u ? (u === "%" ? " %" : " " + u) : ""}`;
const unit = (s) => s.attributes.unit_of_measurement || "";
const isOn = (s) => s.state === "on";
const call = (svc) => (e) => ({ action: "perform-action", perform_action: svc, data: { entity_id: e } });
const valveLike = {
  on: (s) => ["open", "opening", "closing"].includes(s.state),
  fx: (s) => (s.state === "opening" || s.state === "closing" ? "spin" : "ring"),
  text: (s) => numAttr(s, "current_position") != null ? fmt(numAttr(s, "current_position"), "%") : "",
};
const readout = { on: () => false, text: (s) => (numAttr(s) != null ? fmt(numAttr(s), unit(s)) : s.state) };
const DOMAIN_DEV = {
  fan: { on: isOn, fx: "spin", text: (s, on) => on && numAttr(s, "percentage") != null ? fmt(numAttr(s, "percentage"), "%") : "" },
  siren: { on: isOn, fx: "blink" },
  input_boolean: { on: isOn },
  switch: { on: isOn },
  humidifier: { on: isOn, fx: "breath", text: (s) => fmt(numAttr(s, "humidity"), "%") },
  water_heater: { on: (s) => !["off", "unavailable", "unknown"].includes(s.state), fx: "breath", text: (s) => fmt(numAttr(s, "temperature"), "°C") },
  climate: {
    on: (s) => ["heating", "cooling", "drying", "fan", "preheating", "defrosting"].includes(s.attributes.hvac_action) || (!s.attributes.hvac_action && s.state !== "off"),
    fx: "breath",
    text: (s) => [fmt(numAttr(s, "current_temperature"), "°C"), numAttr(s, "temperature") != null ? "→ " + fmt(numAttr(s, "temperature"), "°C") : ""].filter(Boolean).join(" "),
  },
  valve: valveLike,
  cover: valveLike,
  lawn_mower: { on: (s) => s.state === "mowing", fx: "comet" },
  vacuum: { on: (s) => s.state === "cleaning" || s.state === "returning", fx: "comet", battery: true },
  camera: { on: (s) => s.state === "recording" || s.state === "streaming", fx: "radar" },
  person: { on: (s) => s.state === "home", cover: true, text: (s) => (s.state === "home" ? "" : s.state === "not_home" ? "pryč" : s.state) },
  device_tracker: { on: (s) => s.state === "home", cover: true, text: (s) => (s.state === "home" ? "" : s.state === "not_home" ? "pryč" : s.state) },
  script: { on: isOn, fx: "spin", tap: call("script.turn_on") },
  scene: { press: true, tap: call("scene.turn_on") },
  button: { press: true, tap: call("button.press") },
  input_button: { press: true, tap: call("input_button.press") },
  input_select: { on: () => false, text: (s) => s.state },
  select: { on: () => false, text: (s) => s.state },
  number: readout,
  input_number: readout,
  counter: readout,
  sensor: readout,
  weather: { on: () => false, text: (s) => fmt(numAttr(s, "temperature"), s.attributes.temperature_unit || "°C") },
  sun: { on: (s) => s.state === "above_horizon" },
  timer: { on: (s) => s.state === "active", fx: "countdown", progressSelf: true },
  binary_sensor: { on: isOn },
};

class FnsFloorplanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // a hass set before the element was defined hides the setter: pass it through again
    if (Object.prototype.hasOwnProperty.call(this, "hass")) { const v = this.hass; delete this.hass; this.hass = v; }
  }

  setConfig(config) {
    const levelChanged = this._config && this._config.level !== config.level;
    this._config = { mode: "auto", rotate: "auto", ...config };
    if (levelChanged && this._plan) { this._level = config.level; return this._showPlan(); }
    if (this._v) { this._v.update(true); this._v.layout(); }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._v) this._v.update();
    if (!this._unsub && !this._subscribing && !this._failed && !this._tries && this.isConnected) this._subscribe();
    // after a reconnect (HA restart) the old subscription may have died while the integration was loading
    if (hass.connection !== this._conn) {
      this._conn = hass.connection;
      hass.connection?.addEventListener?.("ready", () => {
        clearTimeout(this._retry);
        this._retry = setTimeout(() => {
          try { this._unsub?.(); } catch (err) { /* already gone */ }
          this._unsub = null;
          if (this.isConnected && !this._subscribing) this._subscribe();
        }, 1500);
      });
    }
  }

  getCardSize() { return 9; }
  getGridOptions() { return { columns: "full", min_columns: 6 }; }
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("fns-floorplan-card-editor"); }

  connectedCallback() {
    if (this._v) this._v.attach();
    if (this._hass && !this._unsub && !this._subscribing && !this._failed) this._subscribe();
  }

  disconnectedCallback() {
    clearTimeout(this._retry);
    this._tries = 0;
    this._v?.detach();
    this._unsub?.();
    this._unsub = null;
  }

  // the integration sends the plan now and after every save in the editor
  async _subscribe() {
    this._subscribing = true;
    try {
      const unsub = await this._hass.connection.subscribeMessage((plan) => this._setPlan(plan), { type: "fns_floorplan/plan/subscribe" });
      if (this.isConnected) this._unsub = unsub;
      else unsub();
      this._tries = 0;
    } catch (err) {
      // right after an HA restart the frontend connects before the integration is loaded: try again
      this._tries = (this._tries || 0) + 1;
      if (this._tries > 3 && !this._v) this._message(`Čekám na integraci FNS Floorplan (${err.message || err.code || err})…`);
      clearTimeout(this._retry);
      this._retry = setTimeout(() => { if (this.isConnected && !this._unsub && !this._subscribing) this._subscribe(); }, Math.min(10000, 1000 * this._tries));
    } finally {
      this._subscribing = false;
    }
  }

  _setPlan(plan) {
    const json = JSON.stringify(plan);
    if (json === this._planJson) return; // a reconnect resends the same plan
    this._planJson = json;
    this._plan = plan;
    this._showPlan();
  }

  // draw the chosen floor; with more floors the card shows tabs to switch
  _showPlan() {
    const all = this._plan;
    const levels = levelsOf(all || {});
    window.fnsFloorplanLevels = levels; // the card editor offers them as the default floor
    if (!levels.some((l) => String(l.id) === String(this._level))) this._level = this._config?.level ?? levels[0].id;
    if (!levels.some((l) => String(l.id) === String(this._level))) this._level = levels[0].id;
    const plan = all?.rooms ? { ...planForLevel(all, this._level), _levels: levels, _level: this._level } : all;
    if (!plan?.rooms?.length) {
      this._v?.detach();
      this._v = null;
      this._message("Plán je prázdný. Nakresli ho v panelu Půdorys v postranním menu.");
      return;
    }
    this._v?.detach();
    this._v = buildView(this, plan);
    if (this.isConnected) this._v.attach();
    this._v.update(true);
  }

  _setLevel(id) {
    this._level = id;
    this._showPlan();
  }

  _message(text) {
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><ha-card><div class="app msg"></div></ha-card>`;
    this.shadowRoot.querySelector(".msg").textContent = text;
  }

  _fail(text) {
    this._failed = true;
    this._message(text);
  }
}

// builds the static plan once; returns the hooks the card calls on every hass update
function buildView(card, plan) {
  const root$ = card.shadowRoot;
  root$.innerHTML = `<style>${STYLE}</style>
<ha-card><div class="app">
  <div class="bar"${plan._levels?.length > 1 || card._config?.tools !== false ? "" : " hidden"}>
  <div class="floors"${plan._levels?.length > 1 ? "" : " hidden"}>${(plan._levels || []).map((l) => `<button data-l="${String(l.id).replace(/"/g, "")}"${String(l.id) === String(plan._level) ? ' class="on"' : ""}></button>`).join("")}</div>
  <span class="sp"></span>
  <div class="tools"${card._config?.tools === false ? " hidden" : ""}><button data-t="temp" title="Teploty místností" aria-label="Teploty místností"><ha-icon icon="mdi:thermometer"></ha-icon></button><button data-t="hum" title="Vlhkost místností" aria-label="Vlhkost místností"><ha-icon icon="mdi:water-percent"></ha-icon></button><button data-t="replay" title="Přehrát den" aria-label="Přehrát den"><ha-icon icon="mdi:history"></ha-icon></button></div>
  </div>
  <div class="stage">
    <svg class="plan" preserveAspectRatio="xMidYMid meet"></svg>
    <aside class="sheet">
      <button class="close" aria-label="Zavřít">✕</button>
      <h2></h2>
      <div class="sub"></div>
      <div class="rows"></div>
    </aside>
  </div>
  <div class="legend" hidden></div>
</div></ha-card>`;
  const $ = (sel) => root$.querySelector(sel);
  root$.querySelectorAll("[data-mdi]").forEach((n) => (n.innerHTML = mdiSvg(n.dataset.mdi)));
  const app = $(".app"), stage = $(".stage"), legend = $(".legend"), svg = $("svg.plan"), sheet = $(".sheet");
  root$.querySelectorAll(".floors button").forEach((b, i) => {
    b.textContent = plan._levels[i].name;
    b.addEventListener("click", () => card._setLevel(plan._levels[i].id));
  });
  const hass = () => card._hass;
  const cfg = () => card._config || {};
  let replay = null; // { from, to, t, hist: {id: [[time_ms, state, attributes]]}, view: {}, timer } while replaying
  const curStates = () => (replay ? replay.view : hass().states);
  const st = (id) => (id ? curStates()[id] : undefined);
  const moreInfo = (entityId) =>
    card.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  const toggle = (entityId) => hass().callService("homeassistant", "toggle", { entity_id: entityId });
  const nameOf = (id) => st(id)?.attributes.friendly_name || id;

  // Jinja templates (conditions and texts) are rendered by HA and pushed on every change
  const tpl = new Map(), tplUnsubs = [];
  const isTpl = (v) => typeof v === "string" && v.includes("{{");
  const tplText = (v) => (isTpl(v) ? String(tpl.get(v) ?? "") : v);
  const applyRules = (rules) => {
    const out = evalRules(rules, curStates(), tpl);
    if (out.text != null) out.text = tplText(out.text);
    return out;
  };
  const condOk1 = (c) => condOk(c, curStates(), tpl);
  const templates = new Set();
  const ruleEntities = (rules, into) => {
    for (const r of rules || []) if (r.progress) into.add(r.progress);
    const walk = (c) => { if (c.any) c.any.forEach(walk); else if (c.template) templates.add(c.template); else if (c.entity) into.add(c.entity); };
    for (const r of rules || []) { [].concat(r.if || []).forEach(walk); if (isTpl(r.text)) templates.add(r.text); }
  };

  const rooms = plan.rooms;
  const R = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const roomAt = (x, z) => rooms.find((r) => inPoly([x, z], r.points));
  const furniture = plan.furniture || [];
  const isLight = (f) => /^(lamp|led)/.test(f.type);
  const lampGroups = {};
  for (const f of furniture) if (isLight(f) && f.entity) (lampGroups[f.entity] ||= []).push(f);

  // ---- svg skeleton ----
  // bounds: room outlines plus everything placed in the plan (an icon may sit outside any room, even above or left of it)
  const pts = rooms.flatMap((r) => r.points.map((q) => [q[0], q[1], PAD]));
  const PIN_PAD = 48; // icon radius at the largest scale plus its tag
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    if (typeof o.x === "number" && typeof o.z === "number") pts.push([o.x, o.z, PIN_PAD]);
    for (const v of Object.values(o)) if (v && typeof v === "object") walk(v);
  })(Object.fromEntries(Object.entries(plan).filter(([k]) => k !== "rooms")));
  const X0 = Math.min(...pts.map((q) => q[0] * S + PAD - q[2])), Y0 = Math.min(...pts.map((q) => q[1] * S + PAD - q[2]));
  const W = Math.max(...pts.map((q) => q[0] * S + PAD + q[2])) - X0, H = Math.max(...pts.map((q) => q[1] * S + PAD + q[2])) - Y0;
  const defs = el("defs", {}, svg);
  defs.innerHTML = `<filter id="blurBig" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><feGaussianBlur stdDeviation="18"/></filter>`;
  const root = el("g", {}, svg);
  const layer = (cls = "") => el("g", cls ? { class: cls } : {}, root);
  const gFloor = layer(), gGlow = layer(), gTrail = layer(), gFurn = layer(), gFx = layer(), gAlarm = layer(), gWalls = layer("gwalls");
  const gOpen = layer(), gHits = layer(), gRobot = layer(), gLamps = layer(), gDevices = layer(), gLabels = layer();

  for (const r of rooms) {
    const d = polyD(r.points);
    el("path", { d }, el("clipPath", { id: "clip_" + r.id }, defs));
    const f = el("path", { d, class: "room-floor", "data-room": r.id }, gFloor);
    f.addEventListener("click", () => openSheet(r.id));
    if (r.rules) r.tint = el("path", { d, class: "tint", opacity: 0 }, gFloor);
    r.heat = el("path", { d, class: "heat", opacity: 0 }, gFloor);
    r.glowLayer = el("g", { "clip-path": `url(#clip_${r.id})` }, gGlow);
    el("path", { d, class: "walls" }, gWalls);
    r.fx = el("g", { "clip-path": `url(#clip_${r.id})` }, gFx);
  }

  // the ring and effect layer of a device badge, behind the item's own badge (r = badge radius)
  const fxRing = (parent, r = 17, scale = 1) => {
    const g = el("g", { class: "dev fxo", transform: scale === 1 ? "" : `scale(${scale})` }, parent);
    parent.prepend(g);
    el("circle", { r, class: "ring" }, g);
    return { g, fxG: el("g", { class: "fx" }, g) };
  };
  // furniture outlines with a faint type icon; a wall TV with a media player lights up while it plays
  const tvs = [];
  const hasActions = (f) => f.tap_action || f.hold_action || f.double_tap_action;
  for (const f of furniture) {
    if (isLight(f) || f.type === "robot_vacuum") continue;
    const [cx, cz] = P([f.x, f.z]);
    const w = f.w * S, d = f.d * S;
    const g = el("g", { transform: `translate(${cx} ${cz}) rotate(${f.rotation || 0})`, "data-layer": f.layer || 0 }, gFurn);
    f.g = g;
    if (f.type === "tv_wall") {
      const node = el("rect", { x: -w / 2, y: -Math.max(d, 4) / 2, width: w, height: Math.max(d, 5), rx: 2, class: "tv" }, g);
      if (f.entity) tvs.push({ entity: f.entity, node });
      if (f.entity || hasActions(f)) { g.classList.add("act"); bindActions(card, g, f, INFO); }
      continue;
    }
    f.node = el("rect", { x: -w / 2, y: -d / 2, width: w, height: d, rx: Math.min(6, d / 4), class: "furn" }, g);
    // the icon stays upright and is left out where it would not fit
    const size = Math.min(w, d) * 0.6;
    if (size >= 9 && f.icon !== "none") el("g", { class: "ficon" }, g).innerHTML =
      iconHtml(f.icon, Math.min(size, 26), FURNITURE[f.type]?.[1] || "mdiShapeOutline");
    if (f.entity || hasActions(f)) { g.classList.add("act"); bindActions(card, g, f, INFO); }
    if (f.rules) f.fxo = fxRing(g, 17, Math.max(0.6, Math.min(1.5, Math.min(w, d) / 34)));
  }
  sortLayer(gFurn);
  const ruledFurniture = furniture.filter((f) => (f.rules || f.color) && f.g);

  // openings: doors and windows with a contact swing open and shut (angle eased every frame)
  const swingers = [], blinds = [];
  for (const o of plan.openings || []) {
    const r = R[o.room_id];
    if (!r) continue;
    const p = r.points, a = p[o.edge], b = p[(o.edge + 1) % p.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const s0 = o.offset - o.width / 2, s1 = o.offset + o.width / 2;
    const A = P([a[0] + u[0] * s0, a[1] + u[1] * s0]), B = P([a[0] + u[0] * s1, a[1] + u[1] * s1]);
    const c = centroid(p);
    let n = [-u[1], u[0]];
    const mid = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset];
    if ((c[0] - mid[0]) * n[0] + (c[1] - mid[1]) * n[1] < 0) n = [-n[0], -n[1]];
    const g = el("g", {}, gOpen);
    el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "cut" }, g);
    if (o.style === "passage") continue;
    // tap on a door or window: its contact's detail by default, or the actions set in the editor
    // a blind (cover entity): a band just inside the room, the more closed the stronger
    if (o.blind) {
      const k = o.blind_side === "out" ? -7 : 7; // inside the room by default, or outside the wall
      // a thin track over the whole window and a solid bar as long as the blind is closed
      let a0 = [A[0] + n[0] * k, A[1] + n[1] * k], b0 = [B[0] + n[0] * k, B[1] + n[1] * k];
      // the blind comes down from the top end of the window (the left end on a horizontal wall)
      const vertical = Math.abs(b0[1] - a0[1]) > Math.abs(b0[0] - a0[0]);
      if (vertical ? a0[1] > b0[1] : a0[0] > b0[0]) [a0, b0] = [b0, a0];
      el("line", { x1: a0[0], y1: a0[1], x2: b0[0], y2: b0[1], class: "blind-track" }, gOpen);
      blinds.push({ o, a0, b0, node: el("line", { x1: a0[0], y1: a0[1], x2: a0[0], y2: a0[1], class: "blind" }, gOpen) });
    }
    if (o.blind || o.contact || o.tap_action || o.hold_action || o.double_tap_action) {
      const hit = el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-hit" }, gHits);
      bindActions(card, hit, o, INFO, o.blind || o.contact);
    }
    const isWin = o.type === "window";
    if (isWin) el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "win" }, g);
    if (isWin && !o.contact) continue; // a fixed or unsensed sash stays drawn as glass
    // a door without a contact is drawn ajar at 45°, calm (its real state is unknown);
    // a glass (balcony) door without one stays shut like a window
    const ajar = !isWin && !o.contact && o.style !== "glass";
    // the hinge sits on the side the plan says; the sash swings into the room (or out)
    const hingeAtA = o.hinge !== "right";
    const H0 = hingeAtA ? A : B, E0 = hingeAtA ? B : A;
    const len = Math.hypot(E0[0] - H0[0], E0[1] - H0[1]);
    const along = [(E0[0] - H0[0]) / len, (E0[1] - H0[1]) / len];
    const dir = o.swing === "out" ? -1 : 1;
    const sw = { o, g, H0, len, along, nn: [n[0] * dir, n[1] * dir], max: isWin ? 0.62 : Math.PI / 2, cur: ajar ? Math.PI / 4 : 0, target: ajar ? Math.PI / 4 : 0, isWin, ajar };
    sw.arc = el("path", { class: "door-arc", d: "" }, g);
    sw.leaf = el("line", { class: isWin ? "sash" : "door-leaf", x1: H0[0], y1: H0[1], x2: E0[0], y2: E0[1] }, g);
    swingers.push(sw);
    if (ajar) drawSwing(sw);
  }
  function drawSwing(sw) {
    const a = sw.cur;
    const tip = [
      sw.H0[0] + (sw.along[0] * Math.cos(a) + sw.nn[0] * Math.sin(a)) * sw.len,
      sw.H0[1] + (sw.along[1] * Math.cos(a) + sw.nn[1] * Math.sin(a)) * sw.len,
    ];
    sw.leaf.setAttribute("x2", tip[0]);
    sw.leaf.setAttribute("y2", tip[1]);
    const E0 = [sw.H0[0] + sw.along[0] * sw.len, sw.H0[1] + sw.along[1] * sw.len];
    const cross = sw.along[0] * sw.nn[1] - sw.along[1] * sw.nn[0];
    sw.arc.setAttribute("d", a > 0.02 ? `M${E0[0]},${E0[1]} A${sw.len},${sw.len} 0 0 ${cross > 0 ? 1 : 0} ${tip[0]},${tip[1]}` : "");
    sw.g.classList.toggle("is-open", sw.target > 0 && !sw.ajar);
  }
  function stepSwings() {
    let busy = false;
    for (const sw of swingers) {
      const d = sw.target - sw.cur;
      if (Math.abs(d) > 0.002) { sw.cur += d * 0.07; busy = true; drawSwing(sw); }
      else if (sw.cur !== sw.target) { sw.cur = sw.target; drawSwing(sw); }
    }
    return busy;
  }

  // lamps: one element per light and room (a room's ceiling spots count as one light); strips stay lines
  const lampNodes = [];
  for (const [id, list] of Object.entries(lampGroups)) {
    for (const f of list.filter((f) => f.type === "led_strip")) {
      const [cx, cz] = P([f.x, f.z]);
      const a = ((f.rotation || 0) * Math.PI) / 180, h = (f.w * S) / 2;
      const ends = { x1: cx - Math.cos(a) * h, y1: cz - Math.sin(a) * h, x2: cx + Math.cos(a) * h, y2: cz + Math.sin(a) * h };
      const ln = el("line", { ...ends, class: "strip lamp", "data-layer": f.layer || 0 }, gLamps);
      // the strip is a thin line: a wide invisible one on top takes the taps
      bindActions(card, el("line", { ...ends, class: "strip-hit" }, gHits), f, TOGGLE, id);
      const fxo = f.rules ? fxRing(el("g", { class: "pin", "data-x": cx, "data-z": cz, transform: `translate(${cx} ${cz})` }, gLamps)) : null;
      lampNodes.push({ id, node: ln, strip: true, f, room: roomAt(f.x, f.z), rules: f.rules, fxo });
    }
    // a spotlight is always its own element: it shines its own way
    const byRoom = new Map();
    for (const f of list.filter((f) => f.type !== "led_strip")) {
      const room = roomAt(f.x, f.z), key = f.type === "lamp_spot" ? f : room;
      if (!byRoom.has(key)) byRoom.set(key, { room, fs: [] });
      byRoom.get(key).fs.push(f);
    }
    for (const { room, fs } of byRoom.values()) {
      const f0 = fs[0];
      const x = fs.reduce((s, f) => s + f.x, 0) / fs.length, z = fs.reduce((s, f) => s + f.z, 0) / fs.length;
      const spread = Math.max(...fs.map((f) => Math.hypot(f.x - x, f.z - z)), 0);
      const small = fs.every((f) => f.type === "lamp_table" || f.type === "lamp_wall" || f.type === "lamp_spot");
      const spot = f0.type === "lamp_spot" ? f0 : null;
      const [cx, cz] = P([x, z]);
      const g = el("g", { class: "lamp pin", "data-x": cx, "data-z": cz, "data-k": sizeK(f0), "data-layer": Math.max(...fs.map((f) => f.layer || 0)), transform: `translate(${cx} ${cz})` }, gLamps);
      el("circle", { r: 22, class: "hit" }, g);
      el("circle", { r: small ? 14 : 18, class: "halo" }, g);
      el("circle", { r: small ? 10 : 13, class: "core" }, g);
      // a spotlight's direction: a small arrow on the halo, turned in layout() against the card's rotation
      const dir = spot && el("path", { d: "M17 -4 L23 0 L17 4 Z", class: "spot-dir" }, g);
      el("g", { class: "lamp-icon" }, g).innerHTML = iconHtml(f0.icon, small ? 12 : 16, lightIcon(f0.type));
      bindActions(card, g, f0, TOGGLE, id);
      lampNodes.push({ id, node: g, x, z, spread, small, room, room_light: f0.room_light, fid: f0.id, rules: f0.rules, spot, dir, f: f0, fxo: f0.rules ? fxRing(g, small ? 14 : 18) : null });
    }
  }
  sortLayer(gLamps);

  // appliances, alarm, media players: badge with an animated glyph, a text tag under it
  // a door's lock is drawn as a small lock badge just inside the room, next to the door
  const doorLocks = (plan.openings || []).filter((o) => o.lock && R[o.room_id]).map((o) => {
    const p = R[o.room_id].points, a = p[o.edge], b = p[(o.edge + 1) % p.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const mid = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset], c = centroid(p);
    let n = [-u[1], u[0]];
    if ((c[0] - mid[0]) * n[0] + (c[1] - mid[1]) * n[1] < 0) n = [-n[0], -n[1]];
    return { kind: "lock", entity: o.lock, x: mid[0] + n[0] * 0.3, z: mid[1] + n[1] * 0.3, size: o.lock_size || "s", sheet_hide: o.sheet_hide };
  });
  const devices = [...(plan.devices || []), ...doorLocks].filter((d) => ICON[d.kind]);
  // "other device" with an alarm panel or a lock: same look and states as the dedicated alarm and lock
  for (const d of devices) if (d.kind === "generic" && /^(alarm_control_panel|lock)\./.test(d.entity || "")) d.kind = d.entity.startsWith("lock.") ? "lock" : "alarm";
  // domain defaults of a generic item
  const dom = (d) => (d.kind === "generic" && d.entity ? DOMAIN_DEV[d.entity.split(".")[0]] : null);
  for (const d of devices) {
    const [cx, cz] = P([d.x, d.z]);
    d.g = el("g", { class: "dev pin dev-" + d.kind, "data-x": cx, "data-z": cz, "data-k": sizeK(d), "data-layer": d.layer || 0, transform: `translate(${cx} ${cz})` }, gDevices);
    el("circle", { r: 17, class: "badge" }, d.g);
    el("circle", { r: 17, class: "ring" }, d.g);
    d.fxG = el("g", { class: "fx" }, d.g);
    el("g", { class: "icon" }, d.g).innerHTML = ICON[d.kind]((fallback) => iconHtml(d.icon, 20, fallback, "glyph"));
    d.glyph = d.g.querySelector(".glyph");
    // a media player shows the album or show cover inside its badge while it plays or pauses (person: photo)
    if ((d.kind === "media" || dom(d)?.cover) && d.cover !== false) {
      const id = "cover_" + devices.indexOf(d);
      el("circle", { r: 15 }, el("clipPath", { id }, defs));
      d.coverImg = el("image", { x: -15, y: -15, width: 30, height: 30, preserveAspectRatio: "xMidYMid slice", "clip-path": `url(#${id})`, class: "cover", hidden: "" }, d.g);
      d.coverImg.addEventListener("error", () => { d.coverImg.setAttribute("hidden", ""); d.g.classList.remove("has-cover"); });
    }
    // the tag is scaled in layout() to the room badge's text size, whatever the item's size
    d.tag = el("g", { class: "devtag", transform: "translate(0 33)", hidden: "" }, d.g);
    d.tagBg = el("rect", { rx: 10 }, d.tag);
    d.label = el("text", { class: "devtext", "text-anchor": "middle", y: 3.5 }, d.tag);
    const b = dom(d);
    bindActions(card, d.g, d, b?.tap ? { tap: b.tap(d.entity), hold: { action: "more-info" } } : INFO);
  }
  sortLayer(gDevices);
  // an alarm tints the whole flat: red pulse when triggered, orange while arming or pending
  const alarm = devices.find((d) => d.kind === "alarm");
  const alarmFx = alarm ? el("path", { d: rooms.map((r) => polyD(r.points)).join(" "), class: "alarm-fx" }, gAlarm) : null;
  // battery of a device (a vacuum): its battery sensor and charging sensor from HA's device registry, else the old attribute
  const sibIds = new Map();
  const siblings = (entity) => {
    if (!sibIds.has(entity)) {
      const reg = hass().entities || {}, dev = reg[entity]?.device_id, ids = {};
      if (dev) for (const e of Object.values(reg)) {
        if (e.device_id !== dev) continue;
        const dc = st(e.entity_id)?.attributes.device_class;
        if (dc === "battery" && e.entity_id.startsWith("sensor.")) ids.bat ||= e.entity_id;
        if (dc === "battery_charging" && e.entity_id.startsWith("binary_sensor.")) ids.chg ||= e.entity_id;
      }
      sibIds.set(entity, ids);
    }
    return sibIds.get(entity);
  };
  const charge = (entity, battery) => {
    const ids = { ...siblings(entity) }, s = st(entity);
    if (battery) ids.bat = battery; // chosen in the editor
    const raw = parseFloat(ids.bat ? st(ids.bat)?.state : s?.attributes.battery_level);
    const level = Number.isFinite(raw) ? Math.round(raw) : null;
    const docked = s?.state === "docked";
    // full is not charging, even when the charging sensor stays on in the dock (Roborock)
    const charging = docked && (level == null ? st(ids.chg)?.state === "on" : level < 100 && (!ids.chg || st(ids.chg)?.state === "on"));
    return { level, charging, docked };
  };
  // docked: "⚡ 80 %" while charging, "100 %" when full
  const chargeText = (entity, battery) => { const c = charge(entity, battery); return c.docked && c.level != null ? (c.charging ? `⚡ ${c.level} %` : `${c.level} %`) : ""; };
  const devActive = (d) => {
    const s = st(d.entity);
    if (!s) return false;
    if (d.kind === "lock" && lockState(s.state) === "moving") return true; // locking / unlocking always animates
    if (Array.isArray(d.active)) return d.active.includes(s.state);
    if (d.active && d.active.above != null) return Number(s.state) > d.active.above;
    if (d.active && d.active.entity) return condOk1(d.active);
    const b = dom(d);
    if (b?.press) return false; // scene, button: no lasting "running"
    if (b?.battery && charge(d.entity, d.battery).docked) return true; // in the dock: a ring filled to the battery level
    if (b?.on) return b.on(s);
    if (d.kind === "media") return s.state === "playing";
    if (d.kind === "camera") return s.state === "recording" || s.state === "streaming";
    if (d.kind === "lock") return ["jammed", "moving"].includes(lockState(s.state));
    if (d.kind === "alarm") return s.state !== "disarmed" && !OFF_STATES.has(s.state);
    return !OFF_STATES.has(s.state);
  };
  const devText = (d, on) => {
    // idle: `text`; running: `text_on`, else the media title, else `text` (entities go in as templates)
    const base = d.text ? tplText(d.text) : "";
    // own texts win, else the domain's default text
    const byDom = () => { const s = st(d.entity); return (s && (dom(d)?.battery ? chargeText(d.entity, d.battery) : dom(d)?.text?.(s, on))) || ""; };
    if (!on) return base || byDom();
    if (d.text_on) return tplText(d.text_on);
    if (d.kind === "media") {
      const a = st(d.entity)?.attributes || {};
      const t = [a.media_series_title || a.media_artist, a.media_title].filter(Boolean).join(" – ");
      if (t) return t.length > 28 ? t.slice(0, 27) + "…" : t;
    }
    return base || byDom();
  };
  // the glyph of an alarm, media player or generic item follows its entity (unless it has its own icon)
  function devGlyph(d, ruleIcon) {
    // an icon from a rule wins, then the item's own icon, then the one that follows the entity
    const pick = ruleIcon || d.icon;
    if (pick || d.ruleIcon) {
      if (pick === d.ruleIcon) return;
      d.ruleIcon = pick;
      d.glyphKey = null;
      if (pick === "none") { d.glyph.setAttribute("d", ""); return; }
      if (pick) { resolveIcon(pick).then((p) => p && d.ruleIcon === pick && d.glyph.setAttribute("d", p)); return; }
      d.glyph.setAttribute("d", MDI[ICON_DEFAULT[d.kind]] || "");
    }
    if (!["alarm", "media", "generic", "lock"].includes(d.kind)) return;
    const s = st(d.entity);
    let want = null;
    if (d.kind === "alarm") want = MDI[ALARM_ICON[s?.state] || "mdiShieldOutline"];
    else if (d.kind === "lock") want = MDI[LOCK_ICON[s?.state] || "mdiLock"];
    else if (d.kind === "media") {
      const a = s?.attributes || {};
      want = MDI[/kodi/i.test(a.app_name || d.entity) ? "mdiKodi" : MEDIA_ICON[a.device_class] || "mdiCastVariant"];
    } else if (s) {
      const key = s.entity_id + s.state + (s.attributes.icon || "");
      if (d.glyphKey === key) return;
      d.glyphKey = key;
      resolveIcon(s.attributes.icon, s, hass()).then((p) => p && d.glyph.setAttribute("d", p));
      return;
    }
    if (want && d.glyph.getAttribute("d") !== want) d.glyph.setAttribute("d", want);
  }
  // a card rendered while hidden measures 0: such a tag is measured again on the next render or layout
  function setTag(d, text) {
    if (d.label.textContent === text && (!text || Number(d.tagBg.getAttribute("width")) > 0)) return;
    d.label.textContent = text;
    d.tag.toggleAttribute("hidden", !text);
    if (!text) return;
    const b = d.label.getBBox();
    if (!b.width) return;
    // same look as the room badge: 8 px sides, 4 px top and bottom, round ends
    Object.entries({ x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8 }).forEach(([k, v]) => d.tagBg.setAttribute(k, v));
  }
  // countdown source of a device: longest remaining seen per duration sensor (its full length is unknown)
  const maxLeft = new Map();
  function progressOf(id, d) {
    const s = st(id);
    if (!s) return null;
    const start = ["timestamp", "duration"].includes(s.attributes?.device_class) && d.entity && devActive(d) ? Date.parse(st(d.entity)?.last_changed) : 0;
    const p = progressFrom({ ...s, entity_id: id }, Date.now(), d.progress_total, maxLeft.get(id), start);
    if (p?.secsLeft != null && s.attributes?.device_class === "duration") maxLeft.set(id, p.max);
    return p;
  }
  // a climate's colour follows its hvac_action (heating, cooling) when it has one
  const themeState = (d) => {
    const s = st(d.entity);
    return s && d.kind === "generic" && d.entity.startsWith("climate.") && s.attributes.hvac_action ? { ...s, state: s.attributes.hvac_action } : s;
  };
  // the countdown arc: shrinks with the entity's time or progress, else loops (CSS only, no timers)
  function setArc(g, fxG, p) {
    const arc = fxG.querySelector(".arc");
    if (!arc) return;
    if (p) {
      g.classList.add("prog");
      if (p.secsLeft != null) {
        if (!p.frac) { arc.style.animation = "none"; arc.style.strokeDashoffset = 132; arc.dataset.k = ""; }
        else {
          const total = p.secsLeft / p.frac, key = `${total.toFixed(0)}|${Math.round(p.secsLeft / 5)}`;
          if (arc.dataset.k !== key) {
            arc.dataset.k = key;
            arc.style.strokeDashoffset = "";
            arc.style.animation = `fxCount ${total}s linear forwards`;
            arc.style.animationDelay = `${-(total - p.secsLeft)}s`;
          }
        }
      } else { arc.style.animation = "none"; arc.style.strokeDashoffset = 132 * (1 - p.frac); arc.dataset.k = ""; }
    } else if (g.classList.contains("prog")) {
      g.classList.remove("prog");
      arc.style.animation = arc.style.animationDelay = arc.style.strokeDashoffset = "";
      delete arc.dataset.k;
    }
  }
  // a rule's ring effect on an item without a device badge (light, strip, dock, furniture): runs while a rule sets fx
  function setFx(o, res, col, item, prog) {
    if (!o) return;
    const fx = res.fx && res.fx !== "none" ? res.fx : "";
    o.g.classList.toggle("on", !!fx);
    o.g.classList.toggle("ruled", !!col);
    o.g.style.setProperty("--dev", col || "");
    if (o.g.dataset.fx !== fx) { o.g.dataset.fx = fx; o.fxG.innerHTML = FX_SVG[fx] || ""; }
    setArc(o.g, o.fxG, fx === "countdown" ? prog || (res.progress ? progressOf(res.progress, item) : timedFrom(res._since, res.progress_total, Date.now())) : null);
  }
  function renderDevices() {
    for (const d of devices) {
      const r = applyRules(d.rules);
      d.g.toggleAttribute("hidden", !!r.hide);
      devGlyph(d, r.icon);
      if (d.kind === "lock") d.g.dataset.lk = lockState(st(d.entity)?.state);
      if (d.kind === "dishwasher") d.g.classList.toggle("err", ["error", "actionrequired", "aborting"].includes(String(st(d.entity)?.state).toLowerCase()));
      if (d.kind === "alarm") {
        const s = st(d.entity)?.state;
        const al = s === "triggered" ? "triggered" : s === "arming" || s === "pending" ? "pending" : s && s !== "disarmed" && !OFF_STATES.has(s) ? "armed" : "off";
        d.g.dataset.al = al;
        if (d === alarm) alarmFx.setAttribute("class", "alarm-fx " + al);
      }
      if (d.coverImg) {
        const s = st(d.entity), pic = s && (dom(d)?.cover || s.state === "playing" || s.state === "paused") ? s.attributes.entity_picture : null;
        const url = pic ? (hass().hassUrl ? hass().hassUrl(pic) : pic) : "";
        if (d.coverImg.getAttribute("href") !== url) {
          d.coverImg.setAttribute("href", url);
          d.coverImg.toggleAttribute("hidden", !url);
          d.g.classList.toggle("has-cover", !!url);
        }
      }
      // an alarm going off or counting down always animates, whatever its own "running" states say
      const b = dom(d);
      // press domains (scene, button): beep the ring when the last-run time changes, never "running"
      if (b?.press) {
        const v = st(d.entity)?.state;
        if (d.lastPress !== undefined && v !== d.lastPress) {
          d.g.classList.remove("pressed");
          requestAnimationFrame(() => d.g.classList.add("pressed"));
        }
        d.lastPress = v;
      }
      const on = r.animate ?? (devActive(d) || ["triggered", "pending"].includes(d.g.dataset.al));
      d.g.classList.toggle("on", !!on);
      // a rule's effect, then the item's own, then the alarm's per state (armed radar, arming spin, alarm blink)
      const al = d.g.dataset.al;
      const fx = r.fx || d.fx || ({ armed: "radar", pending: "spin", triggered: "blink" })[al] || (d.g.dataset.lk === "moving" ? "spin" : null)
        || (b?.battery && charge(d.entity, d.battery).docked ? (charge(d.entity, d.battery).level != null ? "countdown" : "breath") : null)
        || (b && (typeof b.fx === "function" ? b.fx(st(d.entity) || {}) : b.fx)) || "ring";
      if (d.g.dataset.fx !== fx) { d.g.dataset.fx = fx; d.fxG.innerHTML = FX_SVG[fx] || ""; }
      // countdown driven by an entity: the arc shrinks as time (or progress) runs, else it just loops
      const pe = r.progress || d.progress || (b?.progressSelf ? d.entity : null);
      // a charging vacuum's ring shows its battery level
      const bat = b?.battery && !pe ? charge(d.entity, d.battery) : null;
      // a set length without an entity: from the rule's start, else from when the device started running
      const p = fx === "countdown" ? (pe ? progressOf(pe, d) : r.progress_total ? timedFrom(r._since, r.progress_total, Date.now())
        : d.progress_total && on ? timedFrom(Date.parse(st(d.entity)?.last_changed), d.progress_total, Date.now())
        : bat?.docked && bat.level != null ? { frac: bat.level / 100 } : null) : null;
      setArc(d.g, d.fxG, p);
      const anim = OWN_ANIM.has(d.kind) ? "" : iconAnim(r.icon || d.icon || st(d.entity)?.attributes.icon, d.entity);
      if ((d.g.dataset.anim || "") !== anim) d.g.dataset.anim = anim;
      // colour: a rule, then the item's own colour (idle / running), else the entity's state colour from the HA theme
      const own = r.color || (on ? d.color_on || d.color : d.color);
      d.g.classList.toggle("ruled", !!own);
      d.g.classList.toggle("themed", !own && !!d.entity);
      d.g.classList.toggle("unavail", !st(d.entity) || ["unavailable", "unknown"].includes(st(d.entity).state));
      d.g.classList.toggle("glow", !!(r.glow && own));
      d.g.style.setProperty("--dev", own ? color(own) : d.entity ? themeColor(d.entity, themeState(d), on) : "");
      d.g.style.setProperty("--wave", r.wave ? color(r.wave) : "");
      setTag(d, r.text ?? devText(d, on));
    }
  }
  function renderRuled() {
    for (const r of rooms) {
      if (!r.tint) continue;
      const res = applyRules(r.rules);
      const c = res.tint || res.color;
      r.tint.style.fill = c ? color(c) : "transparent"; // the fill attribute does not take var()
      r.tint.style.color = c ? color(c) : "";
      r.tint.setAttribute("opacity", c ? (res.opacity ?? 0.14) : 0);
      r.tint.classList.toggle("glow", !!(c && res.glow));
    }
    for (const f of ruledFurniture) {
      const res = applyRules(f.rules);
      f.g.toggleAttribute("hidden", !!res.hide);
      swapIcon(f.g.querySelector(".ficon path"), res.icon);
      if (!f.node) continue;
      const fc = res.color || f.color; // a rule, else the item's own colour
      setFx(f.fxo, res, fc ? color(fc) : "", f);
      f.node.classList.toggle("ruled", !!fc);
      f.node.classList.toggle("glow", !!(fc && res.glow));
      f.node.style.setProperty("--furn", fc ? color(fc) : "");
    }
  }

  // labels: a label never covers the room's light or an appliance, it moves up (or down) out of their way
  const LABEL_AT = plan.labels || {};
  function labelSpot(r) {
    if (LABEL_AT[r.id]) return LABEL_AT[r.id];
    const [x, z] = centroid(r.points);
    const things = lampNodes.filter((l) => !l.strip).map((l) => [l.x, l.z]).concat(devices.map((d) => [d.x, d.z]));
    const busy = (x, z) => things.some(([tx, tz]) => Math.abs(tx - x) < 0.75 && Math.abs(tz - z) < 0.45);
    for (const dz of [0, -0.55, 0.55, -0.9, 0.9]) if (!busy(x, z + dz) && inPoly([x, z + dz], r.points)) return [x, z + dz];
    return [x, z];
  }
  // a label shows the name and the room's data under it: temperature, humidity, any entity or a template
  // (room.label_info, default both climate values); room.label_name false hides the name, label_hidden the label
  const labelInfo = (r) => (r.label_info ?? ["temperature", "humidity"]).filter((k) => (k === "temperature" || k === "humidity" ? r[k] : k));
  for (const r of rooms) {
    const [cx, cz] = P(labelSpot(r));
    const g = el("g", { class: "label", "data-x": cx, "data-z": cz, "data-rot": r.label_rotation || 0 }, gLabels);
    r.labelG = g;
    r.info = labelInfo(r);
    const showName = r.label_name !== false;
    if (r.label_hidden || (!showName && !r.info.length)) { g.setAttribute("hidden", ""); r.labelOff = true; continue; }
    r.labelRect = el("rect", { rx: 10 }, g);
    if (showName) {
      r.nameText = el("text", { class: "name", "text-anchor": "middle", y: r.info.length ? -2 : 4 }, g);
      r.nameText.textContent = r.name;
    }
    if (r.info.length) r.clim = el("text", { class: "clim", "text-anchor": "middle", y: showName ? 12 : 4 }, g);
  }
  const fitLabels = () => {
    // measure only the texts: the group's box includes the rect itself, which would grow on every update
    for (const r of rooms) {
      if (r.labelOff) continue;
      const boxes = [r.nameText, r.clim].filter(Boolean).map((t) => t.getBBox()).filter((b) => b.width);
      if (!boxes.length) continue;
      const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
      const bb = { x: x0, y: y0, width: Math.max(...boxes.map((b) => b.x + b.width)) - x0, height: Math.max(...boxes.map((b) => b.y + b.height)) - y0 };
      r.labelRect.setAttribute("x", bb.x - 8);
      r.labelRect.setAttribute("y", bb.y - 4);
      r.labelRect.setAttribute("width", bb.width + 16);
      r.labelRect.setAttribute("height", bb.height + 8);
    }
  };
  const roomClimate = (r) => {
    const t = Number(st(r.temperature)?.state), h = Number(st(r.humidity)?.state);
    return { t: isFinite(t) ? t : null, h: isFinite(h) ? h : null };
  };
  const stateText = (id) => {
    const s = st(id);
    if (!s || s.state === "unavailable" || s.state === "unknown") return "–";
    const v = Number(s.state), unit = s.attributes.unit_of_measurement;
    const val = s.state !== "" && isFinite(v) ? num(v, Number.isInteger(v) ? 0 : 1) : s.state;
    return unit ? `${val} ${unit}` : val;
  };
  // free text items: an entity's state, a template or plain text, turned and coloured as set in the editor
  const texts = (plan.texts || []).filter((t) => t.entity || t.text);
  for (const t of texts) {
    const [cx, cz] = P([t.x, t.z]);
    t.g = el("g", { class: "tlabel", "data-x": cx, "data-z": cz, "data-k": sizeK(t), "data-rot": t.rotation || 0 }, gLabels);
    t.bg = el("rect", { rx: 10 }, t.g);
    t.txt = el("text", { "text-anchor": "middle", y: 4 }, t.g);
    if (t.entity || hasActions(t)) { t.g.classList.add("act"); bindActions(card, t.g, t, INFO); }
  }
  function renderTexts() {
    if (!hass()) return;
    for (const t of texts) {
      const res = applyRules(t.rules);
      t.g.toggleAttribute("hidden", !!res.hide);
      const text = res.text ?? (t.text ? tplText(t.text) : stateText(t.entity));
      const fg = res.color || t.color, bg = res.background || t.background;
      t.txt.style.fill = fg ? color(fg) : "";
      t.bg.style.fill = bg === "none" ? "transparent" : bg ? color(bg) : "";
      t.bg.style.stroke = bg ? "none" : "";
      if (t.txt.textContent === text && Number(t.bg.getAttribute("width")) > 0) continue;
      t.txt.textContent = text;
      const b = t.txt.getBBox();
      if (!b.width) continue;
      Object.entries({ x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8 }).forEach(([k, v]) => t.bg.setAttribute(k, v));
    }
  }
  function renderLabels() {
    for (const r of rooms) {
      if (r.rules) r.labelG.toggleAttribute("hidden", !!r.labelOff || !!applyRules(r.rules).hide);
      if (!r.clim) continue;
      const { t, h } = roomClimate(r);
      r.clim.innerHTML = r.info.map((k) => {
        if (k === "temperature") return `<tspan class="${t == null ? "t-ok" : t < 19 ? "t-cold" : t > 25 ? "t-hot" : "t-ok"}">${t == null ? "–" : num(t)}°</tspan>`;
        if (k === "humidity") return `<tspan class="t-ok">${h == null ? "–" : Math.round(h)} %</tspan>`;
        return `<tspan class="t-ok">${esc(isTpl(k) ? tplText(k) : stateText(k))}</tspan>`;
      }).join('<tspan class="t-ok"> · </tspan>');
    }
    fitLabels();
  }

  // ---- live state ----
  const lightState = (id) => {
    const s = st(id);
    if (!s) return { on: false, color: LIGHT_DEFAULT, bri: 1 };
    const a = s.attributes;
    const color =
      a.color_mode === "color_temp" && a.color_temp_kelvin ? kelvinHex(a.color_temp_kelvin)
      : a.rgb_color ? hex(a.rgb_color)
      : a.color_temp_kelvin ? kelvinHex(a.color_temp_kelvin)
      : LIGHT_DEFAULT;
    return { on: s.state === "on", color, bri: a.brightness != null ? Math.max(0.05, a.brightness / 255) : 1 };
  };
  function renderLights() {
    for (const r of rooms) r.glowLayer.innerHTML = "";
    for (const L of lampNodes) {
      const res = L.rules ? applyRules(L.rules) : {};
      const hide = !!res.hide;
      L.node.toggleAttribute("hidden", hide);
      if (!L.strip) swapIcon(L.node.querySelector(".lamp-icon path"), res.icon);
      L.fxo?.g.toggleAttribute("hidden", hide);
      if (hide) continue;
      // a rule colour replaces the bulb's colour (and tints the idle icon or strip)
      const rc = res.color ? color(res.color) : "";
      L.node.classList.toggle("ruled", !!rc);
      const s = { ...lightState(L.id) };
      if (rc) s.color = rc;
      setFx(L.fxo, res, s.color, L.f); // without a rule colour the ring has the bulb's colour
      L.node.classList.toggle("on", s.on);
      L.node.style.setProperty("--lamp", s.color);
      // a dimmed light shows a paler badge or strip
      const dim = s.on ? (0.35 + 0.65 * s.bri).toFixed(2) : "";
      if (L.strip) L.node.style.strokeOpacity = dim;
      else L.node.querySelector(".core").style.fillOpacity = dim;
      if (!s.on || !L.room) continue;
      const f = L.f || L;
      const share = f.room_light === false ? 0.15 : typeof f.room_light === "number" ? f.room_light : L.strip ? 0.45 : 1;
      if (L.strip) {
        const [cx, cz] = P([f.x, f.z]);
        const a = ((f.rotation || 0) * Math.PI) / 180, h = (f.w * S) / 2;
        const x1 = cx - Math.cos(a) * h, y1 = cz - Math.sin(a) * h, x2 = cx + Math.cos(a) * h, y2 = cz + Math.sin(a) * h;
        if (f.glow_side === 1 || f.glow_side === -1) {
          // one side only: a band fading away from the strip (side 1 = to the right of its direction)
          const depth = 60 * (0.5 + share), nx = -Math.sin(a) * f.glow_side * depth, nz = Math.cos(a) * f.glow_side * depth;
          const gid = "gs_" + f.id;
          let grad = defs.querySelector("#" + CSS.escape(gid));
          if (!grad) { grad = el("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse" }, defs); el("stop", { offset: "0" }, grad); el("stop", { offset: "1" }, grad); }
          Object.entries({ x1: cx, y1: cz, x2: cx + nx, y2: cz + nz }).forEach(([k, v]) => grad.setAttribute(k, v));
          grad.children[0].style.stopColor = s.color; grad.children[0].setAttribute("stop-opacity", (0.85 * s.bri).toFixed(2));
          grad.children[1].style.stopColor = s.color; grad.children[1].setAttribute("stop-opacity", "0");
          el("path", { d: `M${x1} ${y1} L${x2} ${y2} L${x2 + nx} ${y2 + nz} L${x1 + nx} ${y1 + nz} Z`, fill: `url(#${gid})`, filter: "url(#blurBig)", class: "glow" }, L.room.glowLayer);
          continue;
        }
        el("line", {
          x1, y1, x2, y2,
          style: `stroke: ${s.color}`, "stroke-width": 26 * (0.5 + share), "stroke-linecap": "round",
          opacity: (0.6 * s.bri).toFixed(2), filter: "url(#blurBig)", class: "glow",
        }, L.room.glowLayer);
        continue;
      }
      const rad = (L.spot ? 3 : (L.small ? 1.1 : 2.3) + L.spread * 0.9) * S * (0.6 + 0.4 * share) * (0.55 + 0.45 * s.bri);
      const gid = "g_" + L.fid;
      let grad = defs.querySelector("#" + CSS.escape(gid));
      if (!grad) {
        grad = el("radialGradient", { id: gid }, defs);
        el("stop", { offset: "0" }, grad); el("stop", { offset: ".45" }, grad); el("stop", { offset: "1" }, grad);
      }
      const stops = grad.children;
      stops[0].style.stopColor = s.color; stops[0].setAttribute("stop-opacity", (0.75 * s.bri * share + 0.15).toFixed(2));
      stops[1].style.stopColor = s.color; stops[1].setAttribute("stop-opacity", (0.3 * s.bri * share).toFixed(2));
      stops[2].style.stopColor = s.color; stops[2].setAttribute("stop-opacity", "0");
      const [cx, cz] = P([L.x, L.z]);
      if (L.spot) {
        // a cone of `beam` degrees (default 40) towards `rotation`, fading out with distance
        Object.entries({ gradientUnits: "userSpaceOnUse", cx, cy: cz, r: rad }).forEach(([k, v]) => grad.setAttribute(k, v));
        const a = ((L.spot.rotation || 0) * Math.PI) / 180, h = (((L.spot.beam || 40) / 2) * Math.PI) / 180;
        const pt = (t) => `${cx + Math.cos(t) * rad} ${cz + Math.sin(t) * rad}`;
        el("path", { d: `M${cx} ${cz} L${pt(a - h)} A${rad} ${rad} 0 0 1 ${pt(a + h)} Z`, fill: `url(#${gid})`, class: "glow" }, L.room.glowLayer);
        continue;
      }
      el("circle", { cx, cy: cz, r: rad, fill: `url(#${gid})`, class: "glow" }, L.room.glowLayer);
    }
  }
  const isOpen = (o) => o.contact && st(o.contact)?.state === "on";
  const FRESH_MS = 6000; // an opening pulses this long after it opened, then stays plain orange
  function renderBlinds() {
    for (const b of blinds) {
      const s = st(b.o.blind);
      const raw = s?.attributes.current_position, pos = raw == null ? NaN : Number(raw);
      // HA: 100 = fully open; `blind_invert` for blinds that report it the other way round
      let closed = isFinite(pos) ? 1 - pos / 100 : s?.state === "closed" ? 1 : 0;
      if (b.o.blind_invert && isFinite(pos)) closed = 1 - closed;
      closed = Math.max(0, Math.min(1, closed));
      b.node.setAttribute("x2", b.a0[0] + (b.b0[0] - b.a0[0]) * closed);
      b.node.setAttribute("y2", b.a0[1] + (b.b0[1] - b.a0[1]) * closed);
      b.node.classList.toggle("open", closed < 0.02);
      b.node.classList.toggle("moving", s?.state === "opening" || s?.state === "closing");
    }
  }
  function renderOpenings() {
    renderBlinds();
    for (const sw of swingers) {
      if (sw.ajar) continue;
      const on = isOpen(sw.o);
      sw.target = on ? sw.max : 0;
      sw.g.classList.toggle("alert-open", !!on);
      const age = on ? Date.now() - Date.parse(st(sw.o.contact).last_changed) : Infinity;
      clearTimeout(sw.freshTimer);
      sw.g.classList.toggle("fresh", age < FRESH_MS);
      if (age < FRESH_MS) sw.freshTimer = setTimeout(() => sw.g.classList.remove("fresh"), FRESH_MS - age);
      if (sw.cur === 0 && sw.target === 0) drawSwing(sw);
    }
  }
  const sensors = (plan.sensors || []).map((s) => ({ ...s, room: roomAt(s.x, s.z) })).filter((s) => s.room);
  let fxKey;
  function renderFx() {
    for (const t of tvs) t.node.classList.toggle("playing", !OFF_STATES.has(st(t.entity)?.state ?? "off"));
    // rebuilt only when a sensor turns on/off, so the ripples never restart mid-wave
    const key = sensors.map((s) => { const e = st(s.entity); return s.entity + ":" + (e?.state === "on" ? e.attributes.device_class : ""); }).join("|");
    if (key === fxKey) return;
    fxKey = key;
    for (const r of rooms) r.fx.innerHTML = "";
    for (const s of sensors) {
      const e = st(s.entity);
      if (e?.state !== "on") continue;
      const dc = e.attributes.device_class;
      if (MOTION_CLASSES.has(dc)) {
        const [cx, cz] = P([s.x, s.z]);
        for (const k of ["", " r2", " r3"]) el("circle", { cx, cy: cz, r: 6, class: "ripple" + k }, s.room.fx);
      } else if (dc === "moisture") {
        el("path", { d: polyD(s.room.points), class: "leak" }, s.room.fx);
      }
    }
  }
  function renderMode() {
    const m = cfg().mode;
    // "ha" follows HA's own light / dark theme
    const day = m === "day" || (m === "auto" && st("sun.sun")?.state === "above_horizon") || (m === "ha" && !hass().themes?.darkMode);
    app.dataset.mode = day ? "day" : "night";
  }

  // ---- robot vacuum: drives lanes through the room its sensor reports ----
  const dock = furniture.find((f) => f.type === "robot_vacuum");
  // settings live on the dock; plan.vacuum is the fallback of older plans
  const vacCfg = dock && (dock.entity || plan.vacuum?.entity) ? { entity: dock.entity || plan.vacuum?.entity, room_sensor: dock.room_sensor || plan.vacuum?.room_sensor, room_map: dock.room_map || {} } : plan.vacuum;
  const vac = { on: false, state: null, room: null, path: [], pi: 0, pts: [], tick: 0 };
  let robot = null, trail = null;
  if (vacCfg?.entity && dock) {
    robot = el("g", { class: "robot" }, gRobot);
    el("circle", { r: 14, class: "rbadge" }, robot);
    vac.fxo = fxRing(robot, 14);
    el("g", { class: "ricon" }, robot).innerHTML = iconHtml(dock.icon, 18, "mdiRobotVacuum");
    bindActions(card, robot, dock, INFO, vacCfg.entity);
    trail = el("polyline", { class: "trail", points: "" }, gTrail);
    vac.rp = P([dock.x, dock.z]);
    vac.heading = 0;
  }
  let iconK = 1;
  const placeRobot = () => robot.setAttribute("transform", `translate(${vac.rp[0]} ${vac.rp[1]}) rotate(${vac.heading}) scale(${iconK * sizeK(dock)})`);
  // lanes back and forth through one room; a move to the next lane never cuts through a wall (L-shaped rooms)
  function lanes(room) {
    const pts = room.points;
    const x0 = Math.min(...pts.map((p) => p[0])) + 0.3, x1 = Math.max(...pts.map((p) => p[0])) - 0.3;
    const z0 = Math.min(...pts.map((p) => p[1])) + 0.3, z1 = Math.max(...pts.map((p) => p[1])) - 0.3;
    const out = [];
    let flip = false;
    for (let z = z0; z <= z1 + 1e-6; z += 0.3) {
      const row = [];
      for (let x = x0; x <= x1 + 1e-6; x += 0.1) if (inPoly([x, z], pts)) row.push([x, z]);
      if (!row.length) continue;
      if (flip) row.reverse();
      const last = out[out.length - 1];
      if (last && !segInside(last, row[0], pts)) {
        const via = [row[0][0], last[1]];
        if (inPoly(via, pts)) out.push(via);
      }
      out.push(row[0], row[row.length - 1]);
      flip = !flip;
    }
    return out;
  }
  // routes between rooms go through doors and passages: each one links its room with the room on the other side
  const doorLinks = (plan.openings || []).filter((o) => o.type !== "window" && R[o.room_id]).flatMap((o) => {
    const p = R[o.room_id].points, a = p[o.edge], b = p[(o.edge + 1) % p.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const m = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset], c = centroid(p);
    let n = [-u[1], u[0]];
    if ((c[0] - m[0]) * n[0] + (c[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]]; // n points into the door's room
    const inner = [m[0] + n[0] * 0.35, m[1] + n[1] * 0.35], outer = [m[0] - n[0] * 0.35, m[1] - n[1] * 0.35];
    const other = roomAt(...outer);
    return other ? [{ a: o.room_id, b: other.id, pa: inner, pb: outer }, { a: other.id, b: o.room_id, pa: outer, pb: inner }] : [];
  });
  // waypoints (metres) from the point `from` to the room `to`: breadth-first over the door links, [] when no route
  function route(from, to) {
    const start = roomAt(...from);
    if (!start || !to || start.id === to.id) return [];
    const prev = { [start.id]: null }, queue = [start.id];
    while (queue.length) {
      const id = queue.shift();
      if (id === to.id) break;
      for (const l of doorLinks) if (l.a === id && !(l.b in prev)) { prev[l.b] = l; queue.push(l.b); }
    }
    if (!(to.id in prev)) return [];
    const out = [];
    for (let l = prev[to.id]; l; l = prev[l.a]) out.unshift(l.pa, l.pb);
    return out;
  }
  const unP = (q) => [(q[0] - PAD) / S, (q[1] - PAD) / S];
  // where a stopped robot stands in a room: the spot farthest from lights, badges and labels (up to 1 m), near the middle;
  // null while the card is not laid out (nothing to measure yet)
  function freeSpot(room) {
    const m = root.getScreenCTM()?.inverse();
    if (!m) return null;
    const boxes = [gLamps, gDevices, gLabels].flatMap((g) => [...g.children]).filter((e) => !e.hasAttribute("hidden")).map((e) => {
      const b = e.getBoundingClientRect(), p = new DOMPoint(b.left, b.top).matrixTransform(m), q = new DOMPoint(b.right, b.bottom).matrixTransform(m);
      return [p.x, p.y, q.x, q.y];
    }).filter((b) => b[2] > b[0]);
    const pts = room.points, c = centroid(pts), r = 0.35;
    const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
    const z0 = Math.min(...pts.map((p) => p[1])), z1 = Math.max(...pts.map((p) => p[1]));
    let best = null;
    for (let x = x0 + r; x <= x1 - r + 1e-6; x += 0.1) for (let z = z0 + r; z <= z1 - r + 1e-6; z += 0.1) {
      if (![[x, z], [x - r, z], [x + r, z], [x, z - r], [x, z + r]].every((q) => inPoly(q, pts))) continue;
      const [sx, sz] = P([x, z]);
      const free = Math.min(S, ...boxes.map((b) => Math.hypot(Math.max(b[0] - sx, 0, sx - b[2]), Math.max(b[1] - sz, 0, sz - b[3]))));
      const score = free - Math.hypot(x - c[0], z - c[1]) * S * 0.1;
      if (!best || score > best.score) best = { score, p: [sx, sz] };
    }
    return best ? best.p : P(c);
  }
  function renderVac() {
    if (!robot) return;
    const state = st(vacCfg.entity)?.state;
    const where = st(vacCfg.room_sensor)?.state;
    const room = vacRoom(where, rooms, vacCfg.room_map);
    const docked = state === "docked" || state === "charging";
    const res = dock.rules ? applyRules(dock.rules) : {};
    robot.toggleAttribute("hidden", !!res.hide);
    swapIcon(robot.querySelector(".ricon path"), res.icon);
    // a rule colour replaces the theme's active colour and shows even when the robot is docked
    robot.classList.toggle("ruled", !!res.color);
    // otherwise the theme's colour for the vacuum's state (--state-vacuum-<state>-color, then active / icon colour), as other badges
    const vs = st(vacCfg.entity);
    // an error is red even in a theme without its own error colour
    const err = state === "error";
    robot.style.setProperty("--rob", res.color ? color(res.color)
      : err ? "var(--state-vacuum-error-color, var(--error-color, #db4437))" : themeColor(vacCfg.entity, vs, DOMAIN_DEV.vacuum.on(vs || {})));
    robot.classList.toggle("err", err);
    // stopped out of the dock (idle, paused, error): it stands in the room its sensor reports and blinks
    const stopped = !docked && state && !["cleaning", "returning", "unavailable", "unknown"].includes(state);
    // it moves there when it stops or reports another room (measured again once the card is laid out)
    if (stopped && room && (!vac.stopped || vac.spotLater || !inPoly(unP(vac.rp), room.points))) {
      const p = freeSpot(room);
      vac.spotLater = !p;
      vac.rp = p || P(centroid(room.points)); vac.heading = 0; placeRobot();
    }
    vac.stopped = !!stopped;
    robot.classList.toggle("stopped", !!stopped);
    // in the dock: a ring filled to the battery level, full at 100 % (breathing when the level is unknown), unless a rule sets its own effect
    const c = charge(vacCfg.entity, dock.battery);
    setFx(vac.fxo, { ...res, fx: res.fx || (stopped ? "blink" : c.docked ? (c.level != null ? "countdown" : "breath") : "") }, res.color ? color(res.color) : "var(--rob)", dock,
      !res.fx && c.docked && c.level != null ? { frac: c.level / 100 } : undefined);
    if (state === "cleaning") {
      if (vac.state !== "cleaning" && (vac.state === "docked" || vac.state === null)) vac.pts = [];
      // to a new room through the doors, then lane by lane
      if (room && room !== vac.room) {
        vac.room = room;
        vac.lanes = lanes(room).map(P);
        vac.path = [...route(unP(vac.rp), room).map(P), ...vac.lanes];
        vac.pi = 0;
      }
      vac.on = vac.path.length > 0;
    } else if (state === "returning") {
      if (vac.state !== "returning") { vac.path = [...route(unP(vac.rp), roomAt(dock.x, dock.z)).map(P), P([dock.x, dock.z])]; vac.pi = 0; }
      vac.room = null; vac.on = true;
    } else {
      vac.on = false;
      vac.room = null;
      if (docked) { vac.rp = P([dock.x, dock.z]); vac.heading = 0; vac.pts = []; trail.setAttribute("points", ""); placeRobot(); }
    }
    vac.state = state;
    robot.classList.toggle("on", vac.on || state === "cleaning");
  }
  function stepVac() {
    if (!vac.on) return false;
    const t = vac.path[vac.pi];
    const dx = t[0] - vac.rp[0], dz = t[1] - vac.rp[1], dist = Math.hypot(dx, dz), sp = 0.7;
    if (dist < sp) {
      vac.rp = [t[0], t[1]];
      if (vac.pi < vac.path.length - 1) vac.pi++;
      else if (vac.state === "cleaning" && vac.lanes) { vac.lanes.reverse(); vac.path = vac.lanes; vac.pi = 0; } // keeps going over the room until it leaves
      else vac.on = false;
    } else {
      vac.rp = [vac.rp[0] + (dx / dist) * sp, vac.rp[1] + (dz / dist) * sp];
      vac.heading = (Math.atan2(dz, dx) * 180) / Math.PI;
    }
    placeRobot();
    // the trail keeps whole points (no string slicing) and is redrawn every few frames
    const last = vac.pts[vac.pts.length - 1];
    if (!last || Math.hypot(last[0] - vac.rp[0], last[1] - vac.rp[1]) > 3) {
      vac.pts.push([vac.rp[0], vac.rp[1]]);
      if (vac.pts.length > 3000) vac.pts.splice(0, 500);
    }
    if (++vac.tick % 4 === 0) trail.setAttribute("points", vac.pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "));
    return true;
  }

  // ---- animation loop: runs only while something moves and the card is on screen ----
  let raf = 0, attached = false;
  const frame = () => {
    const busy = stepSwings() | stepVac();
    raf = busy && attached ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!raf && attached) raf = requestAnimationFrame(frame); };

  // ---- room sheet ----
  let sheetRoom = null;
  const row = (rows, html, cls = "row") => {
    const d = document.createElement("div");
    d.className = cls;
    d.innerHTML = html;
    rows.appendChild(d);
    return d;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function openSheet(id) {
    sheetRoom = id;
    const r = R[id];
    root$.querySelectorAll(".room-floor").forEach((f) => f.classList.toggle("sel", f.dataset.room === id));
    sheet.querySelector("h2").textContent = r.name;
    const { t, h } = roomClimate(r);
    // temperature and humidity open their sensors' details
    const sub = sheet.querySelector(".sub");
    sub.innerHTML = t != null ? `<span class="link" data-e="${esc(r.temperature)}">${num(t)} °C</span>` + (h != null ? ` · <span class="link" data-e="${esc(r.humidity)}">${Math.round(h)} % vlhkost</span>` : "") : "bez čidla";
    sub.querySelectorAll("[data-e]").forEach((n) => n.addEventListener("click", () => moreInfo(n.dataset.e)));
    const rows = sheet.querySelector(".rows");
    rows.innerHTML = "";
    // an item can be left out of the panel (sheet_hide); the room can add any entity (sheet_extra)
    const ids = Object.entries(lampGroups).filter(([, l]) => { const here = l.filter((f) => roomAt(f.x, f.z) === r); return here.length && !here.some((f) => f.sheet_hide); }).map(([e]) => e);
    const TOGGLE_DOMAINS = ["light", "switch", "fan", "input_boolean", "humidifier", "siren"];
    for (const e of r.sheet_extra || []) if (TOGGLE_DOMAINS.includes(e.split(".")[0]) && !ids.includes(e)) ids.push(e);
    for (const e of ids) {
      // the whole row opens the light's details, the switch only toggles it
      const line = row(rows, `<span>${esc(nameOf(e))}</span>`, "row link");
      line.addEventListener("click", () => moreInfo(e));
      // HA's own switch (theme colours), a plain one where HA's is not loaded
      const native = customElements.get("ha-switch");
      const b = document.createElement(native ? "ha-switch" : "button");
      if (native) b.checked = st(e)?.state === "on";
      else b.className = "sw" + (st(e)?.state === "on" ? " on" : "");
      b.setAttribute("aria-label", nameOf(e));
      b.addEventListener("click", (ev) => { ev.stopPropagation(); if (!native) toggle(e); });
      if (native) b.addEventListener("change", () => toggle(e));
      line.appendChild(b);
    }
    for (const o of (plan.openings || []).filter((o) => o.room_id === id && o.contact && !o.sheet_hide)) {
      const open = isOpen(o);
      const label = o.type === "window" ? "Okno" : "Dveře";
      row(rows, `<span>${label}</span><span class="st${open ? " open" : ""}">${open ? "otevřeno" : "zavřeno"}</span>`, "row link")
        .addEventListener("click", () => moreInfo(o.contact));
    }
    for (const d of devices.filter((d) => roomAt(d.x, d.z) === r && !d.sheet_hide)) {
      const on = devActive(d);
      row(rows, `<span>${esc(d.name || nameOf(d.entity))}</span><span class="st">${esc(on ? devText(d, on) || "běží" : "vypnuto")}</span>`, "row link")
        .addEventListener("click", () => moreInfo(d.entity));
    }
    for (const e of (r.sheet_extra || []).filter((e) => !TOGGLE_DOMAINS.includes(e.split(".")[0]))) {
      row(rows, `<span>${esc(nameOf(e))}</span><span class="st">${esc(stateText(e))}</span>`, "row link").addEventListener("click", () => moreInfo(e));
    }
    if (!rows.children.length) row(rows, "Nic k ovládání", "row hint");
    sheet.classList.add("open");
    document.addEventListener("keydown", sheetKey, true);
    document.addEventListener("pointerdown", sheetOutside, true);
  }
  // Esc or a press outside the panel closes it; HA dialogs (an entity's details) and room floors do not
  const inDialog = (path) => path.some((n) => /^HA-(MORE-INFO-)?DIALOG$|^HA-MD-DIALOG$|^HA-WA-DIALOG$|^HA-ADAPTIVE-DIALOG$/.test(n.tagName || ""));
  function sheetKey(e) {
    if (e.key === "Escape" && !inDialog(e.composedPath())) closeSheet();
  }
  function sheetOutside(e) {
    const path = e.composedPath();
    if (path.includes(sheet) || inDialog(path) || path.some((n) => n.classList?.contains("room-floor"))) return;
    closeSheet();
  }
  function closeSheet() {
    document.removeEventListener("keydown", sheetKey, true);
    document.removeEventListener("pointerdown", sheetOutside, true);
    sheetRoom = null;
    sheet.classList.remove("open");
    root$.querySelectorAll(".room-floor").forEach((f) => f.classList.remove("sel"));
  }
  sheet.querySelector(".close").addEventListener("click", closeSheet);

  // ---- layout: a narrow card turns a wide plan 90°; on a small screen labels and icons grow so they stay readable ----
  let lastKey = "";
  function layout() {
    const w = app.clientWidth;
    if (!w) return;
    const rot = cfg().rotate;
    const portrait = rot === true || (rot === "auto" && w < 600 && W > H * 1.25);
    svg.setAttribute("viewBox", portrait ? `0 0 ${H} ${W}` : `0 0 ${W} ${H}`);
    stage.style.aspectRatio = portrait ? `${H} / ${W}` : `${W} / ${H}`;
    root.setAttribute("transform", portrait ? `translate(${H + Y0} ${-X0}) rotate(90)` : `translate(${-X0} ${-Y0})`);
    // screen px per plan px as drawn: a very wide card is capped by its height (max-height on the stage)
    const scale = Math.min(stage.clientWidth / (portrait ? H : W), stage.clientHeight / (portrait ? W : H)) || (w - 2) / (portrait ? H : W);
    const kL = Math.min(2.2, Math.max(0.5, 0.95 / scale)), kI = Math.min(1.5, Math.max(0.55, 0.8 / scale));
    const key = `${portrait}|${kL.toFixed(2)}|${kI.toFixed(2)}`;
    if (key === lastKey) return;
    lastKey = key;
    const turn = portrait ? -90 : 0;
    for (const g of gLabels.children) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.z}) rotate(${turn + Number(g.dataset.rot || 0)}) scale(${kL * (g.dataset.k || 1)})`);
    for (const g of root.querySelectorAll(".pin")) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.z}) rotate(${turn}) scale(${kI * (g.dataset.k || 1)})`);
    for (const L of lampNodes) if (L.dir) L.dir.setAttribute("transform", `rotate(${(L.spot.rotation || 0) - turn})`);
    // device tags: same text size as the room badges (labels scale by kL, pins by kI and the item size)
    for (const d of devices) {
      const f = kL / (kI * sizeK(d));
      d.tag.setAttribute("transform", `translate(0 ${17 + 16 * f}) scale(${f})`);
    }
    iconK = kI;
    if (robot) placeRobot();
    fitLabels();
    for (const t of texts) t.txt.textContent = ""; // measured again at the new scale
    for (const d of devices) if (d.label.textContent) setTag(d, d.label.textContent);
    renderTexts();
  }
  const ro = new ResizeObserver(() => layout());
  const clock = () => {
    renderDevices(); // a finishing time counts down without a state change
  };
  let clockTimer = 0;

  // re-render only when one of the plan's entities changed (HA swaps the state object on every change)
  const tracked = new Set(["sun.sun"]);
  for (const id of Object.keys(lampGroups)) tracked.add(id);
  for (const o of plan.openings || []) { if (o.contact) tracked.add(o.contact); if (o.blind) tracked.add(o.blind); }
  for (const s of sensors) tracked.add(s.entity);
  for (const d of devices) { tracked.add(d.entity); if (d.progress) tracked.add(d.progress); ruleEntities(d.rules, tracked); }
  for (const r of rooms) ruleEntities(r.rules, tracked);
  for (const f of ruledFurniture) ruleEntities(f.rules, tracked);
  for (const t of tvs) tracked.add(t.entity);
  for (const r of rooms) {
    if (r.temperature) tracked.add(r.temperature);
    if (r.humidity) tracked.add(r.humidity);
    for (const e of r.sheet_extra || []) tracked.add(e);
    for (const k of r.info || []) if (isTpl(k)) templates.add(k); else if (k.includes(".")) tracked.add(k);
  }
  for (const L of lampNodes) ruleEntities(L.rules, tracked);
  for (const d of devices) for (const v of [d.text, d.text_on]) if (isTpl(v)) templates.add(v);
  for (const t of texts) { if (t.entity) tracked.add(t.entity); if (isTpl(t.text)) templates.add(t.text); ruleEntities(t.rules, tracked); }
  // templates: HA renders them and pushes every new result
  const subscribeTemplates = () => {
    for (const t of templates) {
      hass().connection.subscribeMessage((msg) => {
        const v = "result" in msg ? msg.result : "";
        if (tpl.get(t) === v) return;
        tpl.set(t, v);
        api.update(true);
      }, { type: "render_template", template: t, strict: false, report_errors: false })
        .then((unsub) => { if (attached) tplUnsubs.push(unsub); else unsub(); })
        .catch(() => tpl.set(t, ""));
    }
  };
  if (vacCfg) { tracked.add(vacCfg.entity); if (vacCfg.room_sensor) tracked.add(vacCfg.room_sensor); }
  if (dock) ruleEntities(dock.rules, tracked);
  // battery and charging sensors of vacuums (generic ones and the dock's robot)
  for (const e of [...devices.filter((d) => dom(d)?.battery).map((d) => d.entity), vacCfg?.entity]) if (e) Object.values(siblings(e)).forEach((x) => tracked.add(x));
  for (const x of [...devices.map((d) => d.battery), dock?.battery]) if (x) tracked.add(x);
  const seen = new Map();
  let lastDark;

  // ---- overlays (temperature / humidity colours) and the day replay ----
  const tool = (t) => root$.querySelector(`.tools [data-t="${t}"]`);
  let overlay = null;
  try { overlay = localStorage.getItem("fns-floorplan-overlay") || null; } catch (err) { /* storage blocked */ }
  if (overlay !== "temp" && overlay !== "hum") overlay = null;
  // piecewise linear hue between the given [value, hue] points, clamped outside
  const hue = (v, pts) => {
    if (v <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (v <= pts[i][0]) { const [a, h0] = pts[i - 1], [b, h1] = pts[i]; return h0 + ((h1 - h0) * (v - a)) / (b - a); }
    }
    return pts.at(-1)[1];
  };
  const HEAT = { temp: [[17, 220], [21, 130], [25, 0]], hum: [[30, 30], [50, 130], [70, 210]] };
  function renderHeat() {
    for (const r of rooms) {
      const v = overlay ? Number(st(overlay === "temp" ? r.temperature : r.humidity)?.state) : NaN;
      if (!Number.isFinite(v)) { r.heat.setAttribute("opacity", 0); continue; }
      r.heat.setAttribute("fill", `hsl(${Math.round(hue(v, HEAT[overlay]))}, 75%, 50%)`);
      r.heat.setAttribute("opacity", 0.32);
    }
    for (const t of ["temp", "hum"]) tool(t)?.classList.toggle("on", overlay === t);
    legend.hidden = !overlay;
    if (!overlay) return;
    // HEAT points are evenly spaced (17/21/25, 30/50/70), so space-between puts the labels right under their colour stops
    const pts = HEAT[overlay], u = overlay === "temp" ? " °C" : " %";
    const c = (h) => `hsla(${h}, 75%, 50%, .32)`; // same as the room fill (opacity .32)
    legend.innerHTML = `<i style="background: linear-gradient(90deg, ${pts.map(([, h]) => c(h)).join(", ")}), var(--floor)"></i>`
      + `<div>${pts.map(([v]) => `<span>${v}${u}</span>`).join("")}</div>`;
  }
  for (const t of ["temp", "hum"]) tool(t)?.addEventListener("click", () => {
    overlay = overlay === t ? null : t;
    try { localStorage.setItem("fns-floorplan-overlay", overlay || ""); } catch (err) { /* storage blocked */ }
    renderHeat();
  });

  let bar = null, loading = false;
  const stopReplay = (silent) => {
    if (replay) clearInterval(replay.timer);
    bar?.remove();
    bar = null;
    replay = null;
    tool("replay")?.classList.remove("on");
    if (!silent) api.update(true);
  };
  // the state of every followed entity at time t (untracked ones fall back to the live state)
  const seek = (t) => {
    replay.t = t;
    const view = Object.create(hass().states);
    for (const id of tracked) {
      const list = replay.hist[id];
      if (!list?.length) continue;
      let e = list[0]; // before its first change the entity had that first state
      for (const x of list) { if (x[0] <= t) e = x; else break; }
      const iso = new Date(e[0]).toISOString();
      view[id] = { entity_id: id, state: e[1], attributes: e[2] || {}, last_changed: iso, last_updated: iso };
    }
    replay.view = view;
    bar.querySelector(".rp-time").textContent = new Date(t).toLocaleString("cs-CZ", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    bar.querySelector("input").value = t;
    api.update(true);
  };
  const startReplay = async () => {
    if (loading) return;
    loading = true;
    const btn = tool("replay");
    btn.style.opacity = ".5"; // keep the icon, just dim while loading
    const to = Date.now(), from = to - 24 * 3600e3;
    try {
      const res = await hass().callWS({
        type: "history/history_during_period", start_time: new Date(from).toISOString(), end_time: new Date(to).toISOString(),
        entity_ids: [...tracked].filter(Boolean), minimal_response: false, no_attributes: false, significant_changes_only: false,
      });
      if (!attached) return;
      const hist = {};
      for (const [id, list] of Object.entries(res || {})) {
        let attrs = {}; // compressed states leave out unchanged attributes
        hist[id] = list.map((e) => {
          if (e.a) attrs = e.a;
          const tt = e.lu ?? e.lc;
          return [typeof tt === "string" ? Date.parse(tt) : tt * 1000, e.s, attrs];
        });
      }
      replay = { from, to, t: from, hist, view: null, timer: 0 };
      bar = document.createElement("div");
      bar.className = "replay";
      bar.innerHTML = `<button class="rp-play">▶</button><input type="range" min="${from}" max="${to}" step="60000" value="${from}"><span class="rp-time"></span><button class="rp-close">Živě</button>`;
      stage.appendChild(bar);
      const playBtn = bar.querySelector(".rp-play");
      const pause = () => { clearInterval(replay.timer); replay.timer = 0; playBtn.textContent = "▶"; };
      playBtn.addEventListener("click", () => {
        if (replay.timer) return pause();
        if (replay.t >= to) replay.t = from;
        playBtn.textContent = "⏸";
        replay.timer = setInterval(() => {
          seek(Math.min(to, replay.t + 120000)); // a day in about 72 s
          if (replay.t >= to) pause();
        }, 100);
      });
      bar.querySelector("input").addEventListener("input", (e) => { pause(); seek(Number(e.target.value)); });
      bar.querySelector(".rp-close").addEventListener("click", () => stopReplay());
      tool("replay").classList.add("on");
      seek(from);
    } catch (err) {
      stopReplay(true);
      alert(`Historie nejde načíst: ${err.message || err.code || err}`);
    } finally {
      loading = false;
      btn.style.opacity = "";
    }
  };
  tool("replay")?.addEventListener("click", () => (replay ? stopReplay() : startReplay()));

  hydrate(svg);
  const api = {
    update(force = false) {
      const h = hass();
      if (!h || (replay && !force)) return; // live changes are ignored while replaying
      let changed = force;
      if (h.themes?.darkMode !== lastDark) { lastDark = h.themes?.darkMode; changed = true; }
      for (const id of tracked) {
        const s = h.states[id];
        if (seen.get(id) !== s) { seen.set(id, s); changed = true; }
      }
      if (!changed) return;
      renderMode(); renderLights(); renderOpenings(); renderFx(); renderDevices(); renderRuled(); renderLabels(); renderTexts(); renderVac(); renderHeat();
      if (sheetRoom) openSheet(sheetRoom);
      kick();
    },
    layout,
    attach() {
      attached = true;
      if (templates.size && !tplUnsubs.length && hass()) subscribeTemplates();
      ro.observe(app);
      clearInterval(clockTimer);
      clock();
      clockTimer = setInterval(clock, 10000);
      layout();
      kick();
    },
    detach() {
      attached = false;
      stopReplay(true);
      closeSheet();
      tplUnsubs.splice(0).forEach((u) => u());
      ro.disconnect();
      clearInterval(clockTimer);
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
  return api;
}

// Some dashboard add-on swaps window.customElements for a scoped-registry polyfill. An element
// defined before the swap is unknown to the new registry and HA shows "Custom element doesn't
// exist". Check again a few times and define a subclass in the registry that is current then.
function defineSafe(tag, cls) {
  const ensure = () => {
    if (customElements.get(tag)) return;
    try { customElements.define(tag, class extends cls {}); } catch (err) { /* defined meanwhile */ }
  };
  ensure();
  for (const ms of [500, 2000, 5000, 10000]) setTimeout(ensure, ms);
}

defineSafe("fns-floorplan-card", FnsFloorplanCard);

// visual editor of the card in the dashboard: the card's own options and a way to the plan editor
const EDITOR_SCHEMA = [
  { name: "mode", selector: { select: { mode: "dropdown", options: [
    { value: "auto", label: "Podle slunce" }, { value: "ha", label: "Podle HA (světlý / tmavý motiv)" }, { value: "day", label: "Vždy den" }, { value: "night", label: "Vždy noc" },
  ] } } },
  { name: "rotate", selector: { select: { mode: "dropdown", options: [
    { value: "auto", label: "Automaticky (úzká karta)" }, { value: "true", label: "Vždy otočit o 90°" }, { value: "false", label: "Nikdy" },
  ] } } },
  { name: "tools", selector: { boolean: {} } },
];
const EDITOR_LABELS = { mode: "Vzhled", rotate: "Otočení plánu", level: "Výchozí patro", tools: "Tlačítka vrstev a přehrávání" };
const editorSchema = () => {
  const levels = window.fnsFloorplanLevels || [];
  return levels.length > 1
    ? [...EDITOR_SCHEMA, { name: "level", selector: { select: { mode: "dropdown", options: levels.map((l) => ({ value: String(l.id), label: l.name })) } } }]
    : EDITOR_SCHEMA;
};

class FnsFloorplanCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!this._form) {
      this.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">
        <div class="fp-form"></div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <button class="fp-open">Upravit půdorys</button>
          <span style="color:var(--secondary-text-color);font-size:13px">Světla, spotřebiče, senzory, nábytek a jmenovky se upravují v editoru Půdorys (postranní menu nebo Nastavení → Zařízení a služby → FNS Floorplan → Konfigurovat).</span>
        </div></div>`;
      const btn = this.querySelector(".fp-open");
      btn.style.cssText = "cursor:pointer;padding:8px 16px;border-radius:18px;border:0;background:var(--primary-color);color:var(--text-primary-color,#fff);font:inherit;font-weight:500";
      btn.addEventListener("click", () => {
        // a full page load also closes the card editor dialog
        window.location.assign("/fns-floorplan");
      });
      this._form = document.createElement("ha-form");
      this._form.schema = editorSchema();
      this._form.computeLabel = (s) => EDITOR_LABELS[s.name] || s.name;
      this._form.addEventListener("value-changed", (e) => {
        const v = { ...e.detail.value };
        const config = { ...this._config, mode: v.mode || "auto" };
        if (v.rotate === "true") config.rotate = true;
        else if (v.rotate === "false") config.rotate = false;
        else delete config.rotate;
        if (config.mode === "auto") delete config.mode;
        if (v.tools === false) config.tools = false;
        else delete config.tools;
        if (v.level && v.level !== String((window.fnsFloorplanLevels || [])[0]?.id)) config.level = v.level;
        else delete config.level;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.querySelector(".fp-form").appendChild(this._form);
    }
    this._form.hass = this._hass;
    const r = this._config?.rotate;
    this._form.schema = editorSchema();
    this._form.data = { mode: this._config?.mode || "auto", rotate: r === true ? "true" : r === false ? "false" : "auto", tools: this._config?.tools !== false,
      level: String(this._config?.level ?? (window.fnsFloorplanLevels || [])[0]?.id ?? "") };
  }
}
defineSafe("fns-floorplan-card-editor", FnsFloorplanCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fns-floorplan-card",
  name: "FNS Floorplan",
  description: "Animovaný 2D půdorys se živým stavem domácnosti.",
  preview: false,
});
console.info(`%c FNS-FLOORPLAN %c ${VERSION} `, "color:#fff;background:#6366f1;border-radius:3px 0 0 3px", "color:#6366f1;background:#eef");
// shared with the editor panel, which imports this module under the same URL
// countdown source: what is left of a timer, a progress % sensor, a remaining-time sensor or a finish time
// returns { frac (left, 0..1; a % sensor: done, as a battery), secsLeft (only while time runs), max (longest remaining seen) } or null
// total = optional full length in minutes, maxSeen = longest remaining seen so far (s), start = ms a finish-time run began
function progressFrom(s, now, total, maxSeen, start) {
  if (!s) return null;
  const a = s.attributes || {}, st = s.state;
  const hms = (v) => { const p = String(v ?? "").split(":").map(Number); return p.length === 3 && p.every(Number.isFinite) ? p[0] * 3600 + p[1] * 60 + p[2] : NaN; };
  const out = (left, D, run) => {
    if (!(left >= 0) || !(D > 0)) return null;
    const frac = Math.min(1, Math.max(0, left / D));
    return run ? { frac, secsLeft: left, max: D } : { frac };
  };
  if (s.entity_id?.startsWith("timer.")) {
    const D = hms(a.duration);
    if (st === "active") return out((Date.parse(a.finishes_at) - now) / 1000, D, true);
    if (st === "paused") return out(hms(a.remaining), D, false);
    return null;
  }
  if (a.unit_of_measurement === "%") { const v = parseFloat(st); return Number.isFinite(v) ? { frac: Math.min(1, Math.max(0, v / 100)) } : null; }
  if (a.device_class === "duration") {
    const v = parseFloat(st), left = v * ({ s: 1, min: 60, h: 3600 }[a.unit_of_measurement] || NaN);
    if (!(left > 0)) return null;
    // full length: the set total, else time since the device started plus what is left (an HA restart resets that start), else the longest seen
    const sinceStart = start ? Math.max(0, (now - start) / 1000) + left : 0;
    const D = Number(total) > 0 ? Number(total) * 60 : Math.max(left, sinceStart, left > (maxSeen || 0) ? 0 : maxSeen || 0);
    return out(left, D, true);
  }
  if (a.device_class === "timestamp") {
    const left = (Date.parse(st) - now) / 1000;
    if (!(left > 0)) return null;
    const D = Number(total) > 0 ? Number(total) * 60 : start ? (Date.parse(st) - start) / 1000 : NaN;
    return out(left, D, true);
  }
  return null;
}

// a countdown of a set length (minutes) that started at `start` (ms); over = an empty ring
function timedFrom(start, min, now) {
  const D = Number(String(min).replace(",", ".")) * 60;
  if (!(start > 0) || !(D > 0)) return null;
  const left = D - (now - start) / 1000;
  return left > 0 ? { frac: Math.min(1, left / D), secsLeft: Math.min(left, D), max: D } : { frac: 0 };
}

// the plan room a vacuum's room name points to: the pairing first, then the same name or id (case and accents ignored)
const fold = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function vacRoom(where, rooms, map = {}) {
  if (where == null || where === "" || where === "unknown" || where === "unavailable") return null;
  const id = map[where];
  if (id) return rooms.find((r) => r.id === id) || null;
  return rooms.find((r) => fold(r.name) === fold(where) || r.id === where) || null;
}

export { fold, vacRoom, DOMAIN_DEV, progressFrom, timedFrom, MDI, COLORS, UI_COLORS, color, FURNITURE, lightIcon, SIZES, evalRules, resolveIcon, iconHtml, mdiPath, FX_SVG, STYLE };
