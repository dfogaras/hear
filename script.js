//const Tone = Tone || null;

const SIMPLE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
const NOTES = noteStrs();
let SAMPLER = null;
let SETTINGS = {
  intervals: [3, 4],
  direction: '+', // '-', '+-'
}


function noteStrs() {
  var r = [];
  [1, 2, 3, 4, 5, 6].forEach(function(octave) {
    SIMPLE_NOTES.forEach(function(note) {
      r.push(note + String(octave));    
    })
  });
  return r;
}

function loadSampler(onload) {
  if (SAMPLER && SAMPLER.loaded) {
    onload();
    return;
  }
  let files = {};
  NOTES.forEach(function(ns) {
    files[ns] = ns.replace('#', 's') + '.[mp3|ogg|wav]'; 
  });
  const options = {
    baseUrl: '/samples/piano/',
    release : 1,
    onload: onload
  }
  const sampler = new Tone.Sampler(files, options);
  console.log('sampler created');
  sampler.toMaster();
  SAMPLER = sampler;
}

function noteToStr(noteNum) {
  return noteStrs()[noteNum];
}

function noteNum(noteStr) {
  return NOTES.indexOf(noteStr);
}

function playNum(noteNum) {
  SAMPLER.triggerAttack(noteToStr(noteNum));
}

function intervalStr(intervalNum) {
  return INTERVALS[Math.abs(intervalNum)];
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function randElement(elementsList) {
  return elementsList[randInt(elementsList.length)];
}

function randInRange(low, high) {
  return low + randInt(high - low);
}

function show(elId) {
  document.getElementById(elId).style.display = 'inline'
}

function hide(elId) {
  document.getElementById(elId).style.display = 'none'
}

PAGE_IDS = ["page-settings", "page-excercise", "page-results"]

function showPage(pageElId) {
  console.log('Displaying ' + pageElId);
  PAGE_IDS.forEach(function(elId){ hide(elId);});
  show(pageElId);
}

class SingExcercise {
  constructor(options) {
    this.interval = randElement(options.intervals);
    this.base = randInRange(options.baseLow, options.baseHigh);
  }

  play(next) {
    var msg = 'Sing '
    msg += intervalStr(this.interval);
    if (this.interval != 0) {
      msg += this.interval > 0 ? ' up' : ' down'
    }
    msg += '!'
    document.getElementById('sing-text').innerHTML = msg;
    const self = this; 
    document.getElementById('sing-again-button').onclick =function(){ playNum(self.base); };
    document.getElementById('sing-solution-button').onclick =function(){ playNum(self.base + self.interval); };
    document.getElementById('sing-next').onclick =next;
    document.getElementById('nav-settings').onclick =showSettings;
    show('sing-question');
    show('sing');
    playNum(self.base);
  }
}

function singExcercise() {
  const d = SETTINGS.direction;
  const i = SETTINGS.intervals;
  const options = {
      intervals: i.flatMap(e => d == '+' ? e : (d == '-' ? -e : [ e, -e])),
      baseLow: noteNum('C2'),
      baseHigh: noteNum('C5'),
  };
  new SingExcercise(options).play(next=singExcercise);
}

function startExcercise() {
  showPage('page-excercise');
  singExcercise();
}

function showSettings() {
  showPage('page-settings');
  intervalSettings();
  directionSettings();  
  document.getElementById('settings-start').onclick = function() {
    console.log('settings-start clicked'); 
    loadSampler(startExcercise);
  };
}

function intervalSettings() {
  const selected = SETTINGS.intervals;
  for (let i = 0; i < INTERVALS.length; i++) {
    document.getElementById('settings-int-' + i + '-label').innerHTML = INTERVALS[i];
    let checkbox = document.getElementById('settings-int-' + i);
    checkbox.checked = SETTINGS.intervals.indexOf(i) >= 0;
    const note = i;
    checkbox.onchange = function() {
      if (this.checked) {
        selected.push(note);
      } else {
        selected.splice(selected.indexOf(note), 1);
      }
      console.log("Intervals changed to " + SETTINGS.intervals)
    }
  }
}

function directionSettings() {
  const up = document.getElementById('settings-dir-up');
  const down = document.getElementById('settings-dir-down');
  const updown = document.getElementById('settings-dir-updown');
  up.onclick = function() { SETTINGS.direction = '+'; };
  up.checked = SETTINGS.direction === '+';
  down.onclick = function() { SETTINGS.direction = '-'; };
  down.checked = SETTINGS.direction === '-';
  updown.onclick = function() { SETTINGS.direction = '+-'; };
  updown.checked = SETTINGS.direction === '+-';
}

function main() {
  showSettings();
}

main();

