class Pill {
  constructor(name, className) {
    this.name = name;
    this.className = className;
  }
}

class RNG {
  constructor(seed, shift1, shift2, shift3) {
    this.seed = seed;
    this.shift1 = shift1;
    this.shift2 = shift2;
    this.shift3 = shift3;
  }
  next() {
    let num = this.seed;
    num ^= (num >>> this.shift1) & 0xffffffff;
    num ^= (num << this.shift2) & 0xffffffff;
    num ^= (num >>> this.shift3) & 0xffffffff;
    num &= 0xffffffff;
    num >>>= 0;
    this.seed = num;
    return num;
  }
}

class Seed {
  static char_set = "ABCDEFGHJKLMNPQRSTWXYZ01234V6789";
  static char_rev_dict = {};
  static {
    for (let i = 0; i < Seed.char_set.length; i++) {
      Seed.char_rev_dict[Seed.char_set[i]] = i;
    }
  }
  constructor(seed) {
    if (typeof seed === "number") {
      this.seed = seed;
    } else if (typeof seed === "string") {
      this.seed = Seed.String2Seed(seed);
    }
  }
  static Seed2String(seed) {
    let encoded = [];
    let check_seed = seed;
    let check = 0;
    while (check_seed > 0) {
      check = (check + check_seed) & 0xff;
      check = (check * 2 + (check >>> 7)) & 0xff;
      check_seed >>>= 5;
    }

    seed ^= 0xfef7ffd;
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += Seed.char_set[(seed >> (27 - 5 * i)) & 0x1f];
      // seed >>= 5;
    }
    out += Seed.char_set[(((seed << 8) | check) >> 5) & 0x1f];
    out += Seed.char_set[check & 0x1f];
    return out;
  }
  static String2Seed(string) {
    if (!(string.length == 9 || string.length == 8)) {
      return -1;
    }
    string = string.toUpperCase();
    // let seed = 0;
    let encoded = [];
    for (let i = 0; i < string.length; i++) {
      const char = string[i];
      if (char === " " || char === "-") {
        continue;
      }
      if (!(char in Seed.char_rev_dict)) {
        return -1;
      }
      encoded.push(Seed.char_rev_dict[char]);
    }
    // console.log(encoded)
    const seed_val =
      (((((((((((((encoded[0] << 5) | encoded[1]) << 5) | encoded[2]) << 5) |
        encoded[3]) <<
        5) |
        encoded[4]) <<
        5) |
        encoded[5]) <<
        2) |
        (encoded[6] >> 3)) ^
        0xfef7ffd) >>>
      0;
    let check_seed = seed_val;
    let check = 0;
    while (check_seed > 0) {
      check = (check + check_seed) & 0xff;
      check = (check * 2 + (check >>> 7)) & 0xff;
      check_seed >>>= 5;
    }
    const check_digit = ((encoded[6] << 5) | encoded[7]) & 0xff;

    if (check !== check_digit) {
      console.log("Invalid seed: " + string, seed_val, check, check_digit);
      return -1;
    }
    return seed_val;
  }
}

// const ar = []

const pillStrengths = [
  1, 2, 2, 2, 1, 2, 3, 3, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 2, 1, 2, 1, 2,
  1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 0, 1, 2, 1, 1, 3,
];

const pillNames = [
  "Bad Gas",
  "Bad Trip",
  "Balls of Steel",
  "Bombs Are Key",
  "Explosive Diarrhea",
  "Full Health",
  "Health Down",
  "Health Up",
  "I Found Pills",
  "Puberty",
  "Pretty Fly",
  "Range Down",
  "Range Up",
  "Speed Down",
  "Speed Up",
  "Tears Down",
  "Tears Up",
  "Luck Down",
  "Luck Up",
  "Telepills",
  "48 Hour Energy",
  "Hematemesis",
  "Paralysis",
  "I Can See Forever",
  "Pheromones",
  "Amnesia",
  "Lemon Party",
  "R U A Wizard",
  "Percs!",
  "Addicted!",
  "Re-Lax",
  "???",
  "One Makes You Larger",
  "One Makes You Small",
  "Infested!",
  "Infested?",
  "Power Pill!",
  "Retro Vision",
  "Friends Till The End!",
  "X-Lax",
  "Somethings wrong...",
  "Im Drowsy...",
  "Im Excited!!!",
  "Gulp!",
  "Horf!",
  "Feels like I'm walking on sunshine!",
  "Vurp!",
  "Shot Speed Down",
  "Shot Speed Up",
  "Experimental Pill",
];

const pillColorNames = [
  "Null",
  "Blue Blue",
  "White Blue",
  "Orange Orange",
  "White White",
  "Reddots Red",
  "Pink Red",
  "Blue Cadetblue",
  "Yellow Orange",
  "Orangedots White",
  "White Azure",
  "Black Yellow",
  "White Black",
  "White Yellow",
];
const predeterminedStrengths = [3, 3, 3, 3, 2, 1, 0, -1, -1, 3, 2, 1, -1, -1];

function predictPills(seed, achievements) {
  // console.log(seed, achievements);
  const startRNG = new RNG(seed, 0x3, 0x17, 0x19);
  const stageSeeds = [];
  for (let i = 0; i < 0xe; i++) {
    stageSeeds.push(startRNG.next());
  }
  const initPlayerSeed = startRNG.next();
  startRNG.next();
  const itemPoolRNG = new RNG(startRNG.next(), 1, 9, 0x1d);
  // console.log(itemPoolRNG.seed);
  itemPoolRNG.next();

  for (let i = 0; i < 0x1f; i++) {
    itemPoolRNG.next();
    itemPoolRNG.next();
  }
  const pillColors = [];
  for (let i = 1; i < 0xe; i++) {
    pillColors.push(i);
  }
  l = pillColors.length;
  for (let i = pillColors.length - 1; i > 0; i--) {
    j = itemPoolRNG.next() % l;
    [pillColors[i], pillColors[j]] = [pillColors[j], pillColors[i]];
    l--;
  }
  // console.log(itemPoolRNG.seed, pillColors);

  const availableEffects = [];
  for (let i = 0; i < 50; i++) {
    availableEffects.push(i);
  }

  if (!achievements[0]) {
    availableEffects.splice(availableEffects.indexOf(28), 1);
    availableEffects.splice(availableEffects.indexOf(29), 1);
  }

  if (!achievements[1]) {
    availableEffects.splice(availableEffects.indexOf(30), 1);
    availableEffects.splice(availableEffects.indexOf(31), 1);
  }

  if (!achievements[2]) {
    availableEffects.splice(availableEffects.indexOf(43), 1);
  }
  if (!achievements[3]) {
    availableEffects.splice(availableEffects.indexOf(44), 1);
  }
  if (!achievements[4]) {
    availableEffects.splice(availableEffects.indexOf(45), 1);
  }
  if (!achievements[5]) {
    availableEffects.splice(availableEffects.indexOf(46), 1);
  }
  l = availableEffects.length;
  for (let i = availableEffects.length - 1; i > 0; i--) {
    j = itemPoolRNG.next() % l;
    [availableEffects[i], availableEffects[j]] = [
      availableEffects[j],
      availableEffects[i],
    ];
    l--;
  }
  pill_effects = Array(pillColors.length).fill(0);
  for (let i = 0; i < pillColors.length; i++) {
    if (i < predeterminedStrengths.length && predeterminedStrengths[i] >= 0) {
      for (let j = 0; j < availableEffects.length; j++) {
        if (pillStrengths[availableEffects[j]] == predeterminedStrengths[i]) {
          pill_effects[pillColors[i]] = availableEffects[j];
          availableEffects.splice(j, 1);
          break;
        }
      }
    } else {
      const j = itemPoolRNG.next() % availableEffects.length;
      pill_effects[pillColors[i]] = availableEffects[j];
      availableEffects.splice(j, 1);
    }
  }
  return pill_effects;
}

function predict() {
  const seed = new Seed(parseInt(document.getElementById("seedNumber").value));
  if (seed.seed < 0) {
    alert("Invalid seed");
    return;
  }
  const achievements = [
    document.getElementById("achievement_1").checked,
    document.getElementById("achievement_2").checked,
    document.getElementById("achievement_3").checked,
    document.getElementById("achievement_4").checked,
    document.getElementById("achievement_5").checked,
    document.getElementById("achievement_6").checked,
  ];
  const pill_effects = predictPills(seed.seed, achievements);
  console.log(pill_effects);
  const table = document.getElementById("pillTable");
  table.innerHTML = "";
  for (let i = 1; i < pill_effects.length; i++) {
    const effect = pill_effects[i];
    const pillName = pillNames[effect];
    const pillColorName = pillColorNames[i];

    table.innerHTML += `<tr><td><img src="pills/pill_${i}.png" alt="${pillColorName}"></td><td>${pillColorName}</td><td>${pillName}</td></tr>`;
  }
}

function changedValue() {
  const seed = parseInt(document.getElementById("seedNumber").value);
  if (isNaN(seed)) {
    return;
  }
  if (seed < 0) {
    return;
  }
  predict();
}

function createInfo(){
  const infoDiv = document.createElement("div");
  const infoDropbox = document.createElement("select");
  const infoOptions = pillNames;
  for (let i = 0; i < infoOptions.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = infoOptions[i];
    infoDropbox.appendChild(option);
  }
  infoDiv.appendChild(infoDropbox);

  const pillImgDropdown = document.createElement("select");
  for (let i = 1; i < pillColorNames.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = pillColorNames[i];
    pillImgDropdown.appendChild(option);
  }
  infoDropbox.addEventListener("change", () => {
    setPillInfo();
  });

  pillImgDropdown.addEventListener("change", () => {
    setPillInfo();
  });

  infoDiv.appendChild(pillImgDropdown);

  document.getElementById("info").appendChild(infoDiv);
}

function bfAchievementsOptions()
{
  const seed = new Seed(parseInt(document.getElementById("seedNumber").value));
  if (seed.seed < 0) {
    alert("Invalid seed");
    return;
  }

  for (let i = 0; i < 64; i++) {
    const achievements = [];
    for (let j = 0; j < 6; j++) {
      achievements.push((i & (1 << j)) > 0);
    }
    const pill_effects = predictPills(seed.seed, achievements);
    console.log("Achievement combination: " + achievements, pill_effects);

    const knownPills = document.getElementById("info")
    let correct = 0;
    for (let i = 0; i < knownPills.children.length; i++) {
      const pillInfo = knownPills.children[i];
      const pillEffect = parseInt(pillInfo.children[0].value);
      const pillColor = parseInt(pillInfo.children[1].value)
      console.log(pillEffect, pillColor, pill_effects[pillColor+1])
      if (pill_effects[pillColor] === pillEffect) {
        correct++;
      }
    }
    if (correct == knownPills.children.length) {
      console.log("Achievement combination: " + achievements);
        return achievements;
    }

  } 
  return false;
}

function setPillInfo()
{
  const achievements = bfAchievementsOptions();
  if (!achievements) {
    return;
  }
  for (let i = 0; i < achievements.length; i++) {
    document.getElementById("achievement_" + (i + 1)).checked = achievements[i];
  }
}

function addInfo()
{
  createInfo();
  setPillInfo();
}