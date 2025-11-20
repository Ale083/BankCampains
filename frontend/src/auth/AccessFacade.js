import RBACService from './RBACService.js';

const AccessFacade = (() => {
  function puedeConsultar(user) {
    return RBACService.tienePermiso(user, 'VER_CONSULTAS_POR_FILTRO');
  }

  function puedeRegistrarUsuarios(user) {
    return RBACService.tienePermiso(user, 'REGISTRAR_USUARIOS');
  }

  function puedeVerDashboard(user) {
    return RBACService.tienePermiso(user, 'VER_DASHBOARD');
  }

  function puedeLogin(user) {
    return RBACService.tienePermiso(user, 'LOGIN');
  }

  return {
    puedeConsultar,
    puedeRegistrarUsuarios,
    puedeVerDashboard,
    puedeLogin,
  };
})();

export default AccessFacade;