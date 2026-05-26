
export function getAgeSegment(age) {
  if (age == null || Number.isNaN(age)) return 'Sin segmento';
  if (age < 30) return 'Joven';
  if (age <= 60) return 'Adulto';
  return 'Adulto mayor';
}

export function getJobProfile(job) {
  if (!job) return 'Sin perfil';

  const profesional = ['management', 'technician', 'admin.', 'services'];
  const autonomo = ['entrepreneur', 'self-employed'];
  const operativo = ['blue-collar', 'housemaid', 'services'];

  if (profesional.includes(job)) return 'Profesional';
  if (autonomo.includes(job)) return 'Autónomo';
  if (operativo.includes(job)) return 'Operativo';
  if (job === 'student') return 'Estudiante';
  if (job === 'retired') return 'Retirado';

  return 'Otro';
}

export function getRiskLevel({ default: def, housing, loan }) {
  const hasDefault = def === 'yes';
  const numLoans =
    (housing === 'yes' ? 1 : 0) + (loan === 'yes' ? 1 : 0);

  if (hasDefault) return 'Alto riesgo financiero';
  if (numLoans >= 2) return 'Riesgo medio-alto';
  if (numLoans === 1) return 'Riesgo medio';
  return 'Bajo riesgo financiero';
}
