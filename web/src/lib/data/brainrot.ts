export const animals = [
  "shark","elephant","crocodile","frog","chimpanzee","goose","cat","shrimp","pigeon","dog","tiger","dolphin","penguin","octopus","rabbit","hamster",
] as const;

export const objects = [
  "sneakers","airplane","tire","baseball bat","coffee cup","cactus","telephone","umbrella","guitar","bicycle","computer","microwave","scissors","hammer","sunglasses","backpack",
] as const;

export const food = [
  "coconut","banana","pasta","pizza","cappuccino","spaghetti","gelato","prosciutto","mozzarella","ravioli","tiramisu","espresso","focaccia","risotto","bruschetta","cannoli",
] as const;

export const italianSuffixes = [
  "-ini","-ello","-anto","-ino","-oni","-acci","-otto","-etto","-ucci",
] as const;

export const nonsenseSyllables = [
  "tra","la","tung","coco","fanto","bom","pim","skib","ralla","toro","bani","chuci","walla","pata","fifi","mama","papa",
] as const;

export const onomatopoeia = [
  "boom","crash","bang","pop","zip","whoosh","splat","thud","bing","ding","ring","ping","clang","thwack","kapow","boing",
] as const;

export const italianWords = [
  "bambino","cappuccino","spaghetti","pasta","pizza","gelato","ciao","bello","amore","famiglia","casa","vita","sole","mare","montagna","cielo",
] as const;

export const phraseTemplates = [
  "It's the {X} for me",
  "Not the {X} again!",
  "Only in {place}",
  "That's so {adjective}",
  "When the {X} hits different",
  "POV: You're a {X}",
  "Tell me you're {X} without telling me you're {X}",
] as const;

export const locations = [
  "Ohio","Italy","the Backrooms","TikTok","the Metaverse","Area 51","Atlantis","the Moon","a Discord server","your mom's house","the Shadow Realm","McDonald's",
] as const;

export const adjectives = [
  "sus","cursed","based","cringe","fire","mid","bussin","slay","no cap","periodt","slaps","hits different","lowkey","highkey","valid","iconic",
] as const;

export const traits = [
  "chaotic","mysterious","sneaky","dramatic","elegant","clumsy","powerful","tiny but fierce","always hungry","never sleeps","speaks in riddles","obsessed with music","afraid of water","loves to dance","collects shiny objects","has trust issues",
] as const;

export const powers = [
  "time manipulation","super speed","invisibility","mind reading","shape shifting","teleportation","weather control","gravity defiance","sound mimicry","size changing","dream walking","emotion sensing","reality bending","memory erasing","future sight","element control",
] as const;

export const backstoryElements = [
  "was created in a laboratory accident",
  "escaped from a interdimensional portal",
  "used to be a normal {animal} until",
  "was cursed by an ancient wizard",
  "is the last of their species",
  "comes from a parallel universe where",
  "was raised by a family of",
  "discovered their powers during",
  "is on a secret mission to",
  "was betrayed by their best friend",
  "holds the key to saving the world",
  "is searching for their lost sibling",
] as const;

export type PhraseTemplate = typeof phraseTemplates[number];
export type Location = typeof locations[number];
export type Adjective = typeof adjectives[number];
export type Trait = typeof traits[number];
export type Power = typeof powers[number];
export type BackstoryElement = typeof backstoryElements[number];

export function buildPhrase(template: string, tokens: { X?: string; place?: string; adjective?: string }): string {
  return template
    .replaceAll('{X}', tokens.X ?? '')
    .replaceAll('{place}', tokens.place ?? '')
    .replaceAll('{adjective}', tokens.adjective ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type Animal = typeof animals[number];
export type ObjectItem = typeof objects[number];
export type FoodItem = typeof food[number];
export type ItalianSuffix = typeof italianSuffixes[number];
export type Nonsense = typeof nonsenseSyllables[number];
export type Onomatopoeia = typeof onomatopoeia[number];
export type ItalianWord = typeof italianWords[number];

export function getRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
