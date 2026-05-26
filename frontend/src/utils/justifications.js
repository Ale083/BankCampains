// frontend/src/utils/justifications.js


export function generarJustificacion(top_features) {
  if (!top_features || top_features.length === 0) {
    return [];
  }
  

  const topFive = top_features.slice(0, 5);
  
  return topFive.map(feature => {
    const featureName = feature.feature_name;
    const direction = feature.direction; 
    const isPositive = direction === 'positive';
    

    

    if (featureName.startsWith("cat__")) {
      const parts = featureName.replace("cat__", "").split("_");
      const variable = parts[0];
      const valor = parts.slice(1).join("_");
      

      const variableNames = {
        "job": "ocupación",
        "marital": "estado civil",
        "education": "nivel educativo",
        "default": "crédito en mora",
        "housing": "préstamo hipotecario",
        "loan": "préstamo personal",
        "contact": "canal de contacto",
        "month": "mes de contacto",
        "day_of_week": "día de la semana del contacto",
        "poutcome": "resultado de campaña previa"
      };

      const valueTranslations = {

        "admin.": "administrativo",
        "blue-collar": "obrero",
        "entrepreneur": "empresario",
        "housemaid": "empleada doméstica",
        "management": "gerencia",
        "retired": "jubilado",
        "self-employed": "trabajador independiente",
        "services": "servicios",
        "student": "estudiante",
        "technician": "técnico",
        "unemployed": "desempleado",
        "unknown": "desconocido",

        "divorced": "divorciado",
        "married": "casado",
        "single": "soltero",

        "basic.4y": "educación básica (4 años)",
        "basic.6y": "educación básica (6 años)",
        "basic.9y": "educación básica (9 años)",
        "high.school": "educación secundaria",
        "illiterate": "analfabeto",
        "professional.course": "curso profesional",
        "university.degree": "título universitario",

        "yes": "sí",
        "no": "no",

        "cellular": "celular",
        "telephone": "teléfono fijo",

        "jan": "enero", "feb": "febrero", "mar": "marzo", "apr": "abril",
        "may": "mayo", "jun": "junio", "jul": "julio", "aug": "agosto",
        "sep": "septiembre", "oct": "octubre", "nov": "noviembre", "dec": "diciembre",
   
        "of_week_mon": "lunes", "of_week_tue": "martes", "of_week_wed": "miércoles", "of_week_thu": "jueves", "of_week_fri": "viernes",

        "failure": "fracaso",
        "nonexistent": "inexistente", 
        "success": "éxito"
      };
      
      const variableEsp = variableNames[variable] || variable;
      const valorEsp = valueTranslations[valor] || valor;
      
     
      if (variable === "job") {
        return ` El cliente trabaja como ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "marital") {
        return ` El cliente está ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "education") {
        return ` El cliente tiene ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "default") {
        return ` El cliente ${valorEsp === "no" ? "no tiene" : "tiene"} crédito en mora ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "housing") {
        return ` El cliente ${valorEsp === "sí" ? "tiene" : "no tiene"} préstamo hipotecario ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "loan") {
        return ` El cliente ${valorEsp === "sí" ? "tiene" : "no tiene"} préstamo personal ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "contact") {
        return ` El contacto se realizó por ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "month") {
        return ` El último contacto fue en ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "day") {
        return ` El contacto se realizó un ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      } else if (variable === "poutcome") {
        return ` El resultado de la campaña anterior fue ${valorEsp} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      }
      
      return ` El cliente tiene ${variableEsp} "${valorEsp}" ${isPositive ? '(favorece)' : '(desfavorece)'}`;
    }
    
   
    else if (featureName.startsWith("num__")) {
      const variable = featureName.replace("num__", "");
      const value = feature.original_value;
      
      const variableNames = {
        "age": "edad",
        "campaign": "número de contactos en campaña",
        "pdays": "días desde último contacto", 
        "previous": "contactos previos",
        "emp.var.rate": "tasa de variación del empleo",
        "cons.price.idx": "índice de precios al consumidor",
        "cons.conf.idx": "índice de confianza del consumidor",
        "euribor3m": "tasa Euribor 3 meses",
        "nr.employed": "número de empleados"
      };
      
      const variableEsp = variableNames[variable] || variable;
      
      // Verificar si el valor es válido y numérico
      if (value !== undefined && value !== null && !isNaN(value) && value >= -100 && value <= 10000) {
        // Formatear números decimales para mostrar máximo 2 decimales
        const formattedValue = Number(value) % 1 === 0 ? value : Number(value).toFixed(2);
        return ` El cliente tiene ${variableEsp} de ${formattedValue} ${isPositive ? '(favorece)' : '(desfavorece)'}`;
      }
      
      return ` La variable ${variableEsp} del cliente es significativa ${isPositive ? '(favorece)' : '(desfavorece)'}`;
    }
    
   
    const importance = feature.importance;
    const importancePercentage = (importance * 100).toFixed(2);
    
    return ` La característica "${featureName}" tiene un impacto del ${importancePercentage}% en la predicción ${isPositive ? '(favorece)' : '(desfavorece)'}`;
  });
}
