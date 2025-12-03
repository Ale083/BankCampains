import RBACService from './RBACService.js';

const AccessFacade = (() => {
  
  function puedeVerHistorial() {
    return RBACService.tienePermiso('VER_HISTORIAL');
  }
    
  function puedeConsultar() {
    return RBACService.tienePermiso('VER_CONSULTAS_POR_FILTRO');
  }

  function puedeRegistrarUsuarios() {
    return RBACService.tienePermiso('REGISTRAR_USUARIOS');
  }

  function puedeVerDashboard() {
    return RBACService.tienePermiso('VER_DASHBOARD');
  }

  function puedeExplorarProspectos() {
    return RBACService.tienePermiso('EXPLORAR_PROSPECTOS');
  }

  function puedeVerProbAdquisicionProducto() {
    return RBACService.tienePermiso('PROB_ADQUISICION_PRODUCTO');
  }

  function puedeVerInterpretacionProb() {
    return RBACService.tienePermiso('INTERPRETACION_PROB');
  }

  function puedeVerRecomendacionSugerida() {
    return RBACService.tienePermiso('RECOMENDACION_SUGERIDA');
  }

  function puedeDefinirValoresParametricos() {
    return RBACService.tienePermiso('DEFINIR_VALORES_PARAMETRICOS');
  }

  function puedeAnalizarValoresInfluyentes() {
    return RBACService.tienePermiso('ANALISIS_VALORES_INFLUYENTES');
  }

  function puedeSimularEscenarios() {
    return RBACService.tienePermiso('SIMULACION_ESCENARIOS');
  }

  return {
    puedeVerHistorial,
    puedeConsultar,
    puedeRegistrarUsuarios,
    puedeVerDashboard,
    puedeExplorarProspectos,
    puedeVerProbAdquisicionProducto,
    puedeVerInterpretacionProb,
    puedeVerRecomendacionSugerida,
    puedeDefinirValoresParametricos,
    puedeAnalizarValoresInfluyentes,
    puedeSimularEscenarios,
  };
})();

export default AccessFacade;