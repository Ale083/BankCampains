export const categoricalOptions = {
  job: [
    "admin.",
    "blue-collar",
    "entrepreneur",
    "housemaid",
    "management",
    "retired",
    "self-employed",
    "services",
    "student",
    "technician",
    "unemployed",
    "unknown",
  ],
  marital: ["divorced", "married", "single", "unknown"],
  education: [
    "basic.4y",
    "basic.6y",
    "basic.9y",
    "high.school",
    "illiterate",
    "professional.course",
    "university.degree",
    "unknown",
  ],
  default: ["no", "unknown", "yes"],
  housing: ["no", "unknown", "yes"],
  loan: ["no", "unknown", "yes"],
  contact: ["cellular", "telephone"],
  month: ["apr", "aug", "dec", "jul", "jun", "mar", "may", "nov", "oct", "sep"],
  day_of_week: ["fri", "mon", "thu", "tue", "wed"],
  poutcome: ["failure", "nonexistent", "success"],
};

export const numericStats = {
  age: { min: 17.0, max: 98.0, mean: 40.02406040594348 },
  campaign: { min: 1.0, max: 56.0, mean: 2.567592502670681 },
  pdays: { min: 0.0, max: 999.0, mean: 962.4754540157328 },
  previous: { min: 0.0, max: 7.0, mean: 0.17296299893172767 },
  "emp.var.rate": { min: -3.4, max: 1.4, mean: 0.08188550063125184 },
  "cons.price.idx": { min: 92.201, max: 94.767, mean: 93.57566436826262 },
  "cons.conf.idx": { min: -50.8, max: -26.9, mean: -40.50260027192386 },
  euribor3m: { min: 0.634, max: 5.045, mean: 3.6212908128581147 },
  "nr.employed": { min: 4963.6, max: 5228.1, mean: 5167.035910944935 },
};

export const labelMonth = (code) => {
  const map = {
    jan: "Enero",
    feb: "Febrero",
    mar: "Marzo",
    apr: "Abril",
    may: "Mayo",
    jun: "Junio",
    jul: "Julio",
    aug: "Agosto",
    sep: "Septiembre",
    oct: "Octubre",
    nov: "Noviembre",
    dec: "Diciembre",
  };
  return map[code] || code;
};

export const labelDayOfWeek = (code) => {
  const map = {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
  };
  return map[code] || code;
};

export const labelContact = (code) => {
  const map = {
    cellular: "Celular",
    telephone: "Teléfono fijo",
  };
  return map[code] || code;
};
