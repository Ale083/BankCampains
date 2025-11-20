import { PERMISOS } from "./permisosEnum";

const RBACService = (() => {
  const rolesPermisos = {
    'GERENCIA': [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.REGISTRAR_USUARIOS,
      PERMISOS.VER_HISTORIAL,
      // TODO: agregar los siguientes permisos usando PERMISOS.*
    ],
    'EJECUTIVO': [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_HISTORIAL,
      // TODO: agregar los siguientes permisos usando PERMISOS.*
    ],

  };

  function tienePermiso(permiso) {
    const user = JSON.parse(localStorage.getItem('session'));
    const permisosRol = rolesPermisos[user.permisos] || [];
    return permisosRol.includes(permiso);
  }

  return {
    tienePermiso,
  };
})();

export default RBACService;
