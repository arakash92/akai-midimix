loadAPI(1);

host.defineController("Akai", "Midimix", "1.0", "127e1d40-d43c-11e6-9598-0800200c9a66");
host.defineMidiPorts(1, 1);

host.addDeviceNameBasedDiscoveryPair(["MIDI Mix"], ["MIDI Mix"]);

var CC_RANGE_LO = 0;
var CC_RANGE_HI = 100;

var CC_TRACK_VOLUME_LO = 2;
var CC_TRACK_VOLUME_HI = 9;

var CC_MASTER_TRACK_VOLUME = 10;

var CC_RANGE_MAPPING = {
  trackVolume: {
    lo: 2,
    hi: 9
  },
  trackRecord: {
    lo: 10,
    hi: 17,
  },
  trackMute: {
    lo: 30,
    hi: 37
  },
  trackSolo: {
    lo: 20,
    hi: 27,
  },
  knobs: {
    lo: 40,
    hi: 63
  },
};

/**
** @param string mapName one of the keys of the CC_RANGE_MAPPING object
** @param int the cc number
**
*/
function isCCRangeMapped(mapName, cc)
{
  var map = CC_RANGE_MAPPING[mapName];
  return (cc >= map.lo && cc <= map.hi);
}

function init()
{
  println("- Akai Midimix Controller Script by Arakash.com -");

  host.getMidiInPort(0).setMidiCallback(onMidiPort1);
  noteIn = host.getMidiInPort(0).createNoteInput("Notes");

  //setup 24 rotary knobs
  rotaryKnobs = host.createUserControlsSection(24);
  for(var i = CC_RANGE_MAPPING.knobs.lo; i <= CC_RANGE_MAPPING.knobs.hi; i++)
  {
    rotaryKnobs.getControl(i - CC_RANGE_MAPPING.knobs.lo).setLabel("Knob " + i);
  }
  /*
  var trackNum = 1;
  for(var cc = CC_RANGE_MAPPING.knobs.lo; cc <= CC_RANGE_MAPPING.knobs.hi; cc++)
  {
    var knob = cc - CC_RANGE_MAPPING.knobs.lo;
    if (cc % 3 == 0) trackNum++;
    rotaryKnobs.getControl(knob).setLabel("Track " + trackNum + " Knob " + knob % 3);
  }
  */

  //create trackBank for controlling volume, mute and solo of the first 8 tracks.
  //and master volume too.
  trackBank = host.createMainTrackBank(8, 0, 0);
}


function onMidiPort1(status, index, value)
{
  if (isChannelController(status)) {

    // Volume
    if (isCCRangeMapped("trackVolume", index)) {
      println("Changing volume of track " + trackIndex + " to " + value);

      var trackIndex = index - CC_RANGE_MAPPING.trackVolume.lo;
      var channel = trackBank.getChannel(trackIndex);
      channel.getVolume().setRaw(value / 127);

      return;
    }

    // Record Arm
    if (isCCRangeMapped("trackRecord", index))
    {
        //Haven't figured out how to do this yet...
        return;
    }

    // mute
    if (isCCRangeMapped("trackMute", index)) {
      var trackIndex = index - CC_RANGE_MAPPING.trackMute.lo;
      var channel = trackBank.getChannel(trackIndex);
      //channel.getMute()
      //doesn't look like there is a getMute similar to getSolo...
      return;
    }

    if (isCCRangeMapped("trackSolo", index))
    {
      println("solo index: " + index);
      var trackIndex = index - CC_RANGE_MAPPING.trackSolo.lo;
      var channel = trackBank.getChannel(trackIndex);

      //only toggle solo when we release the button
      if (value == 0)
      {
        channel.getSolo().toggle();
      }

      return;
    }

    if (isCCRangeMapped("knobs", index))
    {
      var knob = index - CC_RANGE_MAPPING.knobs.lo;
      rotaryKnobs.getControl(knob).set(value, 128);

      return;
    }
  }
}


function exit()
{
  println("Thanks for using Arakash's AKai Midimix Script!");
}
