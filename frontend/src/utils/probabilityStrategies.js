// frontend/src/utils/probabilityStrategies.js

/**
 * Patrón Strategy para la interpretación cualitativa de probabilidades
 * Permite definir diferentes estrategias de clasificación según rangos de probabilidad
 */

/**
 * Estrategia para probabilidad Baja (0-0.5)
 */
class LowProbabilityStrategy {
  static matches(probability) {
    return probability < 0.5;
  }

  static getLevel() {
    return 'Baja';
  }

  static getColor() {
    return '#10b981'; // verde
  }

  static getRecommendation(probability) {
    return {
      level: 'Baja',
      decision: 'Se predice No',
      color: '#10b981',
      advice:
        'Probabilidad baja de aceptación. Considerar estrategia de seguimiento personalizado.',
    };
  }
}

/**
 * Estrategia para probabilidad Media (0.5-0.75)
 */
class MediumProbabilityStrategy {
  static matches(probability) {
    return probability >= 0.5 && probability < 0.75;
  }

  static getLevel() {
    return 'Media';
  }

  static getColor() {
    return '#f59e0b'; // naranja/amarillo
  }

  static getRecommendation(probability) {
    return {
      level: 'Media',
      decision: 'Se predice moderadamente favorable',
      color: '#f59e0b',
      advice:
        'Probabilidad media. Se recomienda contacto con argumentación personalizada.',
    };
  }
}

/**
 * Estrategia para probabilidad Alta (0.75-1.0)
 */
class HighProbabilityStrategy {
  static matches(probability) {
    return probability >= 0.75;
  }

  static getLevel() {
    return 'Alta';
  }

  static getColor() {
    return '#ef4444'; // rojo
  }

  static getRecommendation(probability) {
    return {
      level: 'Alta',
      decision: 'Se predice Sí',
      color: '#ef4444',
      advice:
        'Probabilidad alta de aceptación. Se recomienda contacto inmediato.',
    };
  }
}

/**
 * Contexto que aplica la estrategia apropiada según la probabilidad
 */
class ProbabilityInterpreter {
  static strategies = [
    LowProbabilityStrategy,
    MediumProbabilityStrategy,
    HighProbabilityStrategy,
  ];

  /**
   * Obtiene la estrategia que corresponde a una probabilidad dada
   * @param {number} probability - Valor entre 0 y 1
   * @returns {Object} - Estrategia que corresponde
   */
  static getStrategy(probability) {
    const strategy = this.strategies.find((s) => s.matches(probability));
    return strategy || HighProbabilityStrategy;
  }

  /**
   * Interpreta una probabilidad usando la estrategia correspondiente.
   *
   * thresholdsOverride (opcional) en formato:
   * {
   *   contactoInmediato: 75, // % para "Se predice Sí"
   *   segundoIntento: 50     // % frontera Media / Baja (si quieres)
   * }
   *
   * Si no se pasa thresholdsOverride, se usan los cortes por defecto (0.5 y 0.75).
   */
  static interpret(probability, thresholdsOverride) {
    const p = Number(probability) || 0;

    // Caso 1: sin umbrales externos -> usar las estrategias tal como estaban
    if (!thresholdsOverride) {
      const strategy = this.getStrategy(p);
      return {
        level: strategy.getLevel(),
        color: strategy.getColor(),
        recommendation: strategy.getRecommendation(p),
        percentage: Math.round(p * 100),
      };
    }

    // Caso 2: con umbrales configurables (en %)
    const contactoInmediato =
      thresholdsOverride.contactoInmediato != null
        ? thresholdsOverride.contactoInmediato
        : 75;
    const segundoIntento =
      thresholdsOverride.segundoIntento != null
        ? thresholdsOverride.segundoIntento
        : 50;

    const highCut = contactoInmediato / 100;
    const mediumCut = segundoIntento / 100;

    let strategy = LowProbabilityStrategy;

    if (p >= highCut) {
      strategy = HighProbabilityStrategy;
    } else if (p >= mediumCut) {
      strategy = MediumProbabilityStrategy;
    } else {
      strategy = LowProbabilityStrategy;
    }

    return {
      level: strategy.getLevel(),
      color: strategy.getColor(),
      recommendation: strategy.getRecommendation(p),
      percentage: Math.round(p * 100),
    };
  }
}

export {
  ProbabilityInterpreter,
  LowProbabilityStrategy,
  MediumProbabilityStrategy,
  HighProbabilityStrategy,
};
