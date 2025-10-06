const { Schema, model } = require('mongoose');

const datosSchema = new Schema(
  {
    age: { type: Number, min: 0 },
    job: {
      type: String,
      enum: [
        'admin.',
        'blue-collar',
        'entrepreneur',
        'housemaid',
        'management',
        'retired',
        'self-employed',
        'services',
        'student',
        'technician',
        'unemployed',
        'unknown',
      ],
      trim: true,
    },
    marital: {
      type: String,
      enum: ['divorced', 'married', 'single', 'unknown'],
      trim: true,
    },
    education: {
      type: String,
      enum: [
        'basic.4y',
        'basic.6y',
        'basic.9y',
        'high.school',
        'illiterate',
        'professional.course',
        'university.degree',
        'unknown',
      ],
      trim: true,
    },
    default: { type: String, enum: ['yes', 'no', 'unknown'], trim: true },
    housing: { type: String, enum: ['yes', 'no', 'unknown'], trim: true },
    loan: { type: String, enum: ['yes', 'no', 'unknown'], trim: true },
    contact: { type: String, enum: ['cellular', 'telephone'], trim: true },
    month: {
      type: String,
      enum: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
      trim: true,
    },
    day_of_week: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri'], trim: true },
    duration: { type: Number, min: 0 },
    campaign: { type: Number, min: 0 },
    pdays: { type: Number, min: 0 },
    previous: { type: Number, min: 0 },
    poutcome: { type: String, enum: ['failure', 'nonexistent', 'success'], trim: true },
    emp_var_rate: { type: Number },
    cons_price_idx: { type: Number },
    cons_conf_idx: { type: Number },
    euribor3m: { type: Number },
    nr_employed: { type: Number },
    y: { type: String, enum: ['yes', 'no'], trim: true },
  },
  {
    versionKey: false,
    timestamps: false,
    strict: true,
  },
);

datosSchema.index({ y: 1 });
datosSchema.index({ contact: 1, y: 1 });
datosSchema.index({ month: 1 });
datosSchema.index({ job: 1 });
datosSchema.index({ age: 1 });
datosSchema.index({ duration: 1 });
datosSchema.index({ campaign: 1 });
datosSchema.index({ poutcome: 1 });

module.exports = model('Datos', datosSchema);
