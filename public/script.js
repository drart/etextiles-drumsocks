fluid.defaults("flock.littleApp", {
    gradeNames: "fluid.viewComponent",

    components: {
        enviro: {
            type: "flock.enviro"
        },
        playButton: {
            type: "flock.ui.enviroPlayButton",
            container: "#play-button",
            options: {
                listeners: {
                    // Due to a bug in Flocking, we need to
                    // connect/disconnect the Nexus components
                    // whenever the environment is played or pauses.
                    "onPlay.connectVisualization": {
                        func: "{nexusui}.events.onConnect.fire"
                    },
                    "onPause.disconnectVisualization": {
                        func: "{nexusui}.events.onDisconnect.fire"
                    }
                }
            }
        },
        synth: {
            type: "adam.synth.stereosequences"
        },
        freeverbButton: {
            type: "flock.ui.freeverb.freezeButton",
            container: "#freeverb-button"
        },
        leftButton: {
            type: "flock.ui.sequencer.playButton",
            container: "#left-button",
            options: {
                synthAddress: "leftTrigger.freq",
                onVal: 4,
            }
        },
        rightButton: {
            type: "flock.ui.sequencer.playButton",
            container: "#right-button",
            options: {
                synthAddress: "rightTrigger.freq",
                onVal: 4
            }
        },
        nexusui: {
            type: "flock.ui.nexusui",
            container: "#viz"
        }
    },

});

fluid.defaults("adam.synth.stereosequences", {
  gradeNames: "flock.synth",
  
  synthDef: 
    [
        {
          id: "lefty",
          ugen: "flock.ugen.freeverb",
          mix: 0.6,
          damp: 0.4,
          room: {
            ugen: "flock.ugen.sin",
            rate: "control",
            freq: 1 / 4,
            mul: 0.3,
            add: 0.65
          },
          source: {
            ugen: "flock.ugen.sinOsc",
            freq: {
              ugen: "flock.ugen.sequencer",
              durations: [0.25, 0.25, 0.25, 0.25],
              values: [1, 9 / 8, 4 / 3, 3 / 2],
              mul: 220,
              loop: 1.0,
              options: {
                holdLastValue: true
              }
            },
            mul: {
              ugen: "flock.ugen.envGen",
              envelope: {
                levels: [0, 1, 0],
                times: [0.03, 0.2]
              },
              gate: {
                ugen: "flock.ugen.timedGate",
                duration: 100,
                trigger: {
                  id: "leftTrigger",
                  ugen: "flock.ugen.impulse",
                  freq: 4,
                  phase: 0.5
                }
              }
            }
          }
        },
        {
          id: "righty",
          ugen: "flock.ugen.freeverb",
          mix: 0.6,
          damp: 0.4,
          room: {
            ugen: "flock.ugen.sin",
            rate: "control",
            phase: 0.5,
            freq: 1 / 4,
            mul: 0.3,
            add: 0.65
          },
          source: {
            ugen: "flock.ugen.sinOsc",
            freq: {
              ugen: "flock.ugen.sequencer",
              durations: [0.25, 0.25, 0.25],
              values: [1, 4 / 3, 3 / 2],
              mul: 220,
              loop: 1.0,
              options: {
                holdLastValue: true
              }
            },
            mul: {
              ugen: "flock.ugen.envGen",
              envelope: {
                levels: [0, 1, 0],
                times: [0.03, 0.2]
              },
              gate: {
                ugen: "flock.ugen.timedGate",
                duration: 100,
                trigger: {
                  id: "rightTrigger",
                  ugen: "flock.ugen.impulse",
                  freq: 4
                }
              }
            }
          }
        }
      ]
  
});

fluid.defaults("flock.ui.freeverb.freezeButton", {
    gradeNames: "flock.ui.toggleButton",

    strings: {
        off: "unfrozen",
        on: "frozen"
    },

    listeners: {
        on: {
            func: "{synth}.set",
            args: {
                "lefty.mix": 1,
                "lefty.damp": 0,
                "lefty.room.freq": 0,
                "lefty.room.phase": 0.25, // get and then line to here? 
                "righty.mix": 1,
                "righty.damp": 0,
                "righty.room.freq": 0,
                "righty.room.phase": 0.25,
            }
        },
        off: {
            func: "{synth}.set",
            args: {
                "lefty.mix": 0.6,
                "lefty.damp": 0.4,
                "lefty.room.freq": 1/4,
                "lefty.room.phase": 0.5,
                "righty.mix": 0.6,
                "righty.damp": 0.4,
                "righty.room.freq": 1/4,
            }
        },
    }

});

fluid.defaults("flock.ui.sequencer.playButton", {
    gradeNames: "flock.ui.toggleButton",

    onVal: 1,
    offVal: 0,
    synthAddress: undefined,

    model: {
        isOn: true
    },

    listeners: {
        on: {
            func: function( that, synth ){
                synth.set( that.options.synthAddress, that.options.onVal );
            },
            args: ["{that}", "{synth}"] 
        },
        off: {
            func: function( that, synth ){
                synth.set( that.options.synthAddress, that.options.offVal);
            },
            args: ["{that}", "{synth}"] 
        }
    }

});


fluid.defaults("flock.ui.nexusui", {
    gradeNames: "fluid.viewComponent",

    members: {
        scope: null,
        spectrogram: null
    },

    model: {
        width: 300,
        height: 100
    },

    selectors: {
        scope: "#scope",
        spectogram: "#spectogram"
    },

    events: {
        onConnect: null,
        onDisconnect: null
    },

    listeners: {
        "onCreate.setWidth":{
            priority: "first",
            funcName: "flock.ui.nexusui.setWidth",
            args: "{that}"
        },
        "onCreate.createScope": {
            funcName: "flock.ui.nexusui.createScope",
            args: "{that}"
        },
        "onCreate.createSpectrum":{
            funcName: "flock.ui.nexusui.createSpectrum",
            args: "{that}"
        },
        "onConnect.connectScope": {
            "this": "{that}.scope",
            method: "connect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onConnect.connectSpectrum": {
            "this": "{that}.spectogram",
            method: "connect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onDisconnect.disconnectScope": {
            "this": "{that}.scope",
            method: "disconnect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        },
        "onDisconnect.disconnectSpectrum": {
            "this": "{that}.spectogram",
            method: "disconnect",
            args: "{enviro}.audioSystem.nativeNodeManager.outputNode"
        }
    }
});

flock.ui.nexusui.setWidth= function( that ){
    that.applier.change( "width", that.container.innerWidth() );
};

flock.ui.nexusui.createSpectrum = function( that ){
    that.scope = new Nexus.Oscilloscope( that.options.selectors.scope, {
        size: [that.model.width, that.model.height]
    });
};

flock.ui.nexusui.createScope = function( that ){
    that.spectogram = new Nexus.Spectrogram( that.options.selectors.scope, {
        size: [that.model.width, that.model.height]
    });
};



flock.littleApp("main");
