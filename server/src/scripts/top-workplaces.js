const fs = require('fs');

function loadArray(file) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/^import[^\n]*\n/, '');
  text = text.replace(/export const \w+:[^=]*=\s*/, '');
  text = text.replace(/;\s*$/, '');
  return eval(text); // parse as JS
}

function main() {
  const shifts = loadArray('./prisma/seed/shifts.ts');
  const workplaces = loadArray('./prisma/seed/workplaces.ts');

  const counts = {};
  for (const shift of shifts) {
    if (shift.worker && !shift.cancelledAt) {
      const id = shift.workplace.connect.id;
      counts[id] = (counts[id] || 0) + 1;
    }
  }

  const active = workplaces
    .map((w, i) => ({ id: i + 1, name: w.name, status: w.status }))
    .filter((w) => w.status === 0)
    .map((w) => ({ name: w.name, shifts: counts[w.id] || 0 }));

  active.sort((a, b) => b.shifts - a.shifts);
  const top = active.slice(0, 3);
  console.log(JSON.stringify(top, null, 2));
}

main();
