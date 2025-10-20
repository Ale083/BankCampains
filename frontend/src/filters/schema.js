export const ENUMS = {
  job: ["admin.","blue-collar","entrepreneur","housemaid","management","retired","self-employed","services","student","technician","unemployed","unknown"],
  marital: ["single","married","divorced","unknown"],
  education: ["illiterate","basic.4y","basic.6y","basic.9y","high.school","professional.course","university.degree","unknown"],
  default: ["yes","no","unknown"],
  housing: ["yes","no","unknown"],
  loan: ["yes","no","unknown"],
  contact: ["cellular","telephone"],
  month: ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"],
  day_of_week: ["mon","tue","wed","thu","fri"],
  poutcome: ["failure","nonexistent","success","unknown"],
  y: ["yes","no"]
};

export const NUM_RANGES = {
  age: [18, 95],
  duration: [0, 871],           
  campaign: [1, 63],
  pdays: [-1, 999],
  previous: [0, 7],
  emp_var_rate: [-3.4, 1.4],
  cons_price_idx: [92.2, 94.8],
  cons_conf_idx: [-50, -26],
  euribor3m: [0.6, 5.05],
  nr_employed: [4965, 5228.1]
};

export const CATS = Object.keys(ENUMS);
export const NUMS = Object.keys(NUM_RANGES);
