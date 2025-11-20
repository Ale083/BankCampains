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


  return {
    puedeVerHistorial,
    puedeConsultar,
    puedeRegistrarUsuarios,
    puedeVerDashboard,
  };
})();

export default AccessFacade;