import EventBus from "./eventBus.js";
import {COMMAND, EVENT, SETTINGS} from "./enum.js";
import UI from "./ui/ui.js";
import Host from "./host.js";
import Editor from "./editor.js";
import Tracker from "./tracker.js";
import Playlist from "./models/playlist.js";
import ModalDialog from "./ui/components/modalDialog.js";
import Midi from "./audio/midi.js";
import Y from "./ui/yascal/yascal.js";
import Plugin from "../plugins/loader.js";
import Input from "./ui/input.js";
import Layout from "./ui/app/layout.js";
import UIElement from "./ui/components/element.js";
import UIImage from "./ui/components/image.js";
import Scale9Panel from "./ui/components/scale9.js";
import Assets from "./ui/assets.js";
import Label from "./ui/components/label.js";
import Button from "./ui/components/button.js";
import RadioGroup from "./ui/components/radiogroup.js";
import Checkbox from "./ui/components/checkbox.js";
import Panel from "./ui/components/panel.js";

var App = (function(){
    var me = {};

    var saveWarningActionType = 0;
    var saveWarningItemURL = "";
    var saveWarningIndex = 0;

	me.setSaveWarningActionType = function(value){
		saveWarningActionType = value;
	}

    me.setSaveWarningItemURL = function(value){
        saveWarningItemURL = value;
    }

    me.setSaveWarningIndex = function(value){
        saveWarningIndex = value;
    }
    
    me.buildNumber = (typeof window.buildNumber === "undefined") ? "" : window.buildNumber;
    
    me.init = function(){
    	
		if (typeof Midi === "object" && SETTINGS && SETTINGS.midi && SETTINGS.midi!=="disabled") Midi.init();
    	
        EventBus.on(EVENT.command,function(command){
            window.focus();
            
            switch (command){
                case COMMAND.newFile:
                    var saveWarningStatus = Editor.getSaveWarningStatus();
                    if (saveWarningStatus == 0){
                        Tracker.stop();
                        Tracker.new();
                    }else{
                        me.setSaveWarningActionType(0);
                        me.doCommand(COMMAND.showSaveWarning);
                    }
                    break;
                case COMMAND.openFile:
                    EventBus.trigger(EVENT.showView,"diskop_modules_load");
                    break;
                case COMMAND.saveFile:
                    EventBus.trigger(EVENT.showView,"diskop_modules_save");
                    break;
                case COMMAND.clearTrack:
                    Editor.clearTrack();
                    break;
                case COMMAND.clearPattern:
					Editor.clearPattern();
                    break;
                case COMMAND.clearInstruments:
                    Tracker.clearInstruments();
                    break;
				case COMMAND.clearSong:
					Editor.clearSong();
					break;
                case COMMAND.showMain:
                    EventBus.trigger(EVENT.showView,"main");
                    break;
                case COMMAND.showTopMain:
                    EventBus.trigger(EVENT.showView,"topmain");
                    break;
                case COMMAND.showBottomMain:
                    EventBus.trigger(EVENT.showView,"bottommain");
                    break;
                case COMMAND.showOptions:
                    EventBus.trigger(EVENT.showView,"options");
                    break;
                case COMMAND.showFileOperations:
                    EventBus.trigger(EVENT.showView,"diskop_load");
                    break;
                case COMMAND.showSampleEditor:
                    EventBus.trigger(EVENT.showView,"sample");
                    break;
                case COMMAND.togglePiano:
                    EventBus.trigger(EVENT.toggleView,"piano");
                    break;
                case COMMAND.toggleSideBar:
                    console.log("toggle sidebar");
                    Layout.hasSideBar = !Layout.hasSideBar;
                    EventBus.trigger(EVENT.appLayoutChanged);
                    EventBus.trigger(EVENT.toggleView,"main");
                    break;
                case COMMAND.showAbout:
                    var dialog = ModalDialog();
                    dialog.setProperties({
                        width: UI.mainPanel.width,
                        height: UI.mainPanel.height,
                        top: 0,
                        left: 0,
                        ok: true
                    });
                    dialog.onClick = dialog.close;

                    var version = Host.getVersionNumber();
                    var build = Host.getBuildNumber();
                    var bassoonVersion = Host.getBassoonVersionNumber();
                    var bassoonBuild = Host.getBassoonBuildNumber();
                    dialog.setText("*Saxomposer//A JavaScript Amiga MOD and XM tracker/based off of BassoonTracker " + bassoonVersion + "//©2025 Bingies24/©2017-2025 Steffest//Version " + version + "/Build number " + buildNumber);

                    UI.setModalElement(dialog);
                    break;
                case COMMAND.showHelp:
                    window.open("https://www.stef.be/bassoontracker/docs/");
                    break;
                case COMMAND.showGithub:
                    window.open("https://github.com/steffest/bassoontracker");
                    break;
				case COMMAND.showStats:
				    var stats = document.getElementById("MrDStats");
				    if (!stats){
						var script=document.createElement('script');
						script.onload=function(){
							var stats=new Stats();
							document.body.appendChild(stats.dom);
							requestAnimationFrame(function loop(){
								stats.update();
								requestAnimationFrame(loop)
							});
						};
						script.src='script/plugins/stats.js';
						document.head.appendChild(script);
						break;
                    }
					break;
				case COMMAND.cut:
					UI.cutSelection(true);
					break;
				case COMMAND.copy:
					UI.copySelection(true);
					break;
				case COMMAND.paste:
					UI.pasteSelection(true);
					break;
				case COMMAND.pattern2Sample:
					Editor.renderTrackToBuffer();
					break;
                case COMMAND.undo:
                    EventBus.trigger(EVENT.commandUndo);
                    break;
                case COMMAND.redo:
                    EventBus.trigger(EVENT.commandRedo);
                    break;
				case COMMAND.nibbles:
                    EventBus.trigger(EVENT.showView,"main");
					Plugin.load("Nibbles",function(){
						Nibbles.init({
                            UI:{
                                element: UIElement,
                                image: UIImage,
                                Assets: Assets,
                                scale9Panel: Scale9Panel,
                                label: Label,
                                button: Button,
                                radioGroup: RadioGroup,
                                checkbox: Checkbox,
                                panel: Panel
                            },
                            Input: Input,
                            Y: Y,
                            EventBus: EventBus,
                            EVENT: EVENT,
                            COMMAND: COMMAND,
                            Layout: Layout
                        });
					});
					break;
                case COMMAND.generator:
                    Plugin.load("Generator",function(){
                        Generator.init({
                            UI:UI,
                            Input: Input,
                            Y: Y,
                            EventBus: EventBus,
                            EVENT: EVENT,
                            COMMAND: COMMAND,
                            Layout: Layout
                        });
                    });
                    break;
                case COMMAND.play:
                    Tracker.togglePlay();
                    break;
                case COMMAND.playNext:
                    Playlist.next();
                    break;
                case COMMAND.playPrevious:
                    Playlist.prev();
                    break;
                case COMMAND.toggleShuffle:
                    Playlist.toggleShuffle();
                    break;
                default:
                    EventBus.trigger(command);
                    break;
                case COMMAND.showSaveWarning:
                    var dialog = ModalDialog();
                    dialog.setProperties({
                        width: UI.mainPanel.width,
                        height: UI.mainPanel.height,
                        top: 0,
                        left: 0,
                        yes: true,
                        no: true
                    });

                    dialog.onClick = function(touchData){
                        var elm = dialog.getElementAtPoint(touchData.x,touchData.y);
                        if (elm && elm.name){
                            UI.setStatus("");
                            if (elm.name === "yesbutton"){
                                if (saveWarningActionType == 0){
                                    Tracker.stop();
                                    dialog.close();
                                    Tracker.new();
                                    Editor.setSaveWarningStatus(0);
                                }else if (saveWarningActionType == 1){
                                    dialog.close();
                                    Tracker.load(saveWarningItemURL);
                                }else if (saveWarningActionType == 2){
                                    dialog.close();
                                    Tracker.load(saveWarningItemURL,true);

                                    if ('URLSearchParams' in window) {
                                        const url = new URL(window.location);
                                        url.searchParams.set("index", saveWarningIndex);
                                        history.pushState(null, '', url);
                                    }

                                    EventBus.trigger(EVENT.playListIndexChanged,saveWarningIndex);
                                }
                            }else{
                                dialog.close();
                            }
                        }
                    };

                    dialog.setText("////UNSAVED PROGRESS//Are you sure you want to leave the current song without saving?");

                    UI.setModalElement(dialog);
                    break;
            }
        });
    };

    me.doCommand = function(command){
        EventBus.trigger(EVENT.command,command);
    };

    return me;
})();

export default App;