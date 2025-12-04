
import { ProbabilityInterpreter } from './probabilityStrategies.js';
import { predictProbability } from '../api/predictions.js';
import { generarJustificacion } from './justifications.js';


class ClientEvaluationTemplate {

  async evaluateClient(clientData) {
    try {
      
      const validatedData = await this.validateClientData(clientData);
      
      
      const predictionResult = await this.calculateProbability(validatedData);
      
      
      const explanation = await this.generateExplanation(predictionResult, validatedData);
      
  
      const recommendation = await this.generateRecommendation(predictionResult);
      
      return this.consolidateResult(validatedData, predictionResult, explanation, recommendation);
      
    } catch (error) {
      return this.handleError(error, clientData);
    }
  }


  // acá van las validaciones de los datos de entrada arturo
  async validateClientData(clientData) {
    if (!clientData || typeof clientData !== 'object') {
      throw new Error('Los datos del cliente son requeridos');
    }


    const requiredFields = ['age', 'job', 'marital', 'education'];
    for (const field of requiredFields) {
      if (clientData[field] === undefined || clientData[field] === null) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    if (typeof clientData.age !== 'number' || clientData.age < 18 || clientData.age > 120) {
      throw new Error('La edad debe ser un número entre 18 y 120 años');
    }

    return { ...clientData }; 
  }

  
  async calculateProbability(validatedData) {
    const rawResult = await predictProbability(validatedData);
    
    
    return {
      probabilidad: rawResult.probabilidad ?? rawResult.probability ?? 0,
      nivel: rawResult.nivel ?? rawResult.level ?? 'Baja',
      clase: rawResult.clase ?? rawResult.class ?? 0,
      threshold_usado: rawResult.threshold_usado ?? rawResult.threshold ?? 0.25,
      top_features: rawResult.top_features ?? [],
      raw: rawResult
    };
  }

 
  async generateExplanation(predictionResult, clientData) {
    const { top_features, probabilidad, nivel } = predictionResult;
    
    if (!top_features || !Array.isArray(top_features) || top_features.length === 0) {
      return {
        justifications: [],
        summary: 'No se pudieron identificar factores influyentes específicos.',
        factorCount: 0,
        hasExplanation: false
      };
    }

    const justifications = generarJustificacion(top_features);
    const percentage = Math.round(probabilidad * 100);
    
    return {
      justifications,
      summary: `Esta probabilidad del ${percentage}% es ${nivel?.toLowerCase()} basada en ${justifications.length} factor${justifications.length !== 1 ? 'es' : ''} principal${justifications.length !== 1 ? 'es' : ''}.`,
      factorCount: justifications.length,
      hasExplanation: true
    };
  }

  
  async generateRecommendation(predictionResult) {
    const { probabilidad } = predictionResult;
    

    const thresholds = this.getContactThresholds();
    const percentage = probabilidad * 100;
    
    let decision, operationalAdvice;
    
    if (percentage >= thresholds.contactoInmediato * 100) {
      decision = 'Contactar inmediatamente';
      operationalAdvice = { action: 'Contacto inmediato' };
    } else if (percentage >= thresholds.segundoIntento * 100) {
      decision = 'Segundo intento';
      operationalAdvice = { action: 'Segundo intento' };
    } else {
      decision = 'No priorizar';
      operationalAdvice = { action: 'No priorizar seguimiento' };
    }
    
    return {
      decision,
      operationalAdvice,
      timestamp: new Date().toISOString()
    };
  }

  
  getContactThresholds() {
    const STORAGE_KEY = 'bankCampains_contact_thresholds';
    const DEFAULT_THRESHOLDS = {
      contactoInmediato: 0.75,    
      segundoIntento: 0.50,      
      noPriorizar: 0.50         
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading contact thresholds:', error);
      }
    }
    return DEFAULT_THRESHOLDS;
  }


  consolidateResult(validatedData, predictionResult, explanation, recommendation) {
    return {
      
      prediction: predictionResult,
      explanation,
      recommendation,
      
      
      templateMethod: {
        client: validatedData,
        evaluation: {
          completed: true,
          timestamp: new Date().toISOString(),
          steps: ['validated', 'predicted', 'explained', 'recommended'],
          version: '1.0.0'
        }
      }
    };
  }

  handleError(error, clientData) {
    console.error('Error en evaluación Template Method:', error);
    
    return {
      prediction: null,
      explanation: {
        justifications: [],
        summary: 'Error en la evaluación: ' + error.message,
        factorCount: 0,
        hasExplanation: false,
        error: error.message
      },
      recommendation: {
        level: 'Error',
        decision: 'Evaluación incompleta',
        advice: 'Revise los datos del cliente e intente nuevamente.',
        operationalAdvice: {
          action: 'Revisar datos'
        }
      },
      templateMethod: {
        client: clientData,
        evaluation: {
          completed: false,
          timestamp: new Date().toISOString(),
          error: error.message,
          version: '1.0.0'
        }
      }
    };
  }
}


export const clientEvaluator = new ClientEvaluationTemplate();

export default ClientEvaluationTemplate;
