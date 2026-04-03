export interface StateData {
  name: string;
  numbers: string[];
  city: string;
  note: string;
}

function generateNumbers(areaCode: string, count: number): string[] {
  const nums: string[] = [];
  for (let i = 0; i < count; i++) {
    const mid = String(Math.floor(Math.random() * 900) + 100);
    const end = String(Math.floor(Math.random() * 9000) + 1000);
    nums.push(`+1${areaCode}${mid}${end}`);
  }
  return nums;
}

const firstNames = ['james','john','robert','michael','david','sarah','jennifer','lisa','jessica','emily','daniel','chris','matt','andrew','brian','kevin','jason','ryan','mark','steven','ashley','nicole','amanda','megan','rachel','laura','hannah','olivia','emma','sophia'];
const lastNames = ['smith','johnson','williams','brown','jones','garcia','miller','davis','rodriguez','martinez','wilson','anderson','thomas','taylor','moore','jackson','martin','lee','thompson','white','harris','clark','lewis','robinson','walker','young','king','wright','hill','scott'];
const domains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','aol.com','icloud.com','mail.com','protonmail.com'];

function generateEmails(count: number): string[] {
  const emails: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    let email: string;
    do {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const num = Math.floor(Math.random() * 999);
      const domain = domains[Math.floor(Math.random() * domains.length)];
      email = `${first}.${last}${num}@${domain}`;
    } while (used.has(email));
    used.add(email);
    emails.push(email);
  }
  return emails;
}

export const demoStates: StateData[] = [
  { name: "Connecticut", numbers: generateNumbers("203", 1470), city: "Hartford", note: "" },
  { name: "New York", numbers: generateNumbers("212", 1960), city: "New York", note: "" },
  { name: "California", numbers: generateNumbers("310", 980), city: "Los Angeles", note: "" },
  { name: "Texas", numbers: generateNumbers("214", 1225), city: "Dallas", note: "" },
  { name: "Florida", numbers: generateNumbers("305", 1715), city: "Miami", note: "" },
  { name: "Illinois", numbers: generateNumbers("312", 735), city: "Chicago", note: "" },
  { name: "Ohio", numbers: generateNumbers("216", 490), city: "Cleveland", note: "" },
  { name: "Pennsylvania", numbers: generateNumbers("215", 1470), city: "Philadelphia", note: "" },
];

export const demoEmailStates: StateData[] = [
  { name: "Connecticut", numbers: generateEmails(1470), city: "Hartford", note: "" },
  { name: "New York", numbers: generateEmails(1960), city: "New York", note: "" },
  { name: "California", numbers: generateEmails(980), city: "Los Angeles", note: "" },
  { name: "Texas", numbers: generateEmails(1225), city: "Dallas", note: "" },
  { name: "Florida", numbers: generateEmails(1715), city: "Miami", note: "" },
  { name: "Illinois", numbers: generateEmails(735), city: "Chicago", note: "" },
  { name: "Ohio", numbers: generateEmails(490), city: "Cleveland", note: "" },
  { name: "Pennsylvania", numbers: generateEmails(1470), city: "Philadelphia", note: "" },
];
