fluid.defaults("flock.littleApp", {
  gradeNames: "fluid.viewComponent",

  components: {
    enviro: {
      type: "flock.enviro"
    },
    playButton: {
      type: "flock.ui.enviroPlayButton",
      container: "#play-button"
    },
    synth: {
      type: "adam.synth.stereosequences"
    }
  },

});

fluid.defaults("adam.synth.stereosequences", {
  gradeNames: "flock.synth",
  
  synthDef: 
    [
        {
          ugen: "flock.ugen.freeverb",
          mix: 0.6,
          damp: 0.4,
          room: {
            ugen: "flock.ugen.sin",
            rate: "control",
            freq: 1 / 4,
            mul: 0.3,
            add: 0.6
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
                  ugen: "flock.ugen.impulse",
                  freq: 4,
                  phase: 0.5
                }
              }
            }
          }
        },
        {
          ugen: "flock.ugen.freeverb",
          mix: 0.6,
          damp: 0.4,
          room: {
            ugen: "flock.ugen.sin",
            rate: "control",
            phase: 0.5,
            freq: 1 / 4,
            mul: 0.3,
            add: 0.6
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
                  ugen: "flock.ugen.impulse",
                  freq: 4
                }
              }
            }
          }
        }
      ]
  
});


flock.littleApp("main");