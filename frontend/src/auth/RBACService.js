// rbacService.js
const RBACService = (() => {
  const rolesPermisos = {
    GERENCIA: [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.REGISTRAR_USUARIOS,
      PERMISOS.LOGIN,
      // TODO: agregar los siguientes permisos usando PERMISOS.*
    ],
    EJECUTIVO: [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.LOGIN,
      // TODO: agregar los siguientes permisos usando PERMISOS.*
    ],

  };

  function tienePermiso(user, permiso) {
    const permisosRol = rolesPermisos[user.role] || [];
    return permisosRol.includes(permiso);
  }

  return {
    tienePermiso,
  };
})();

export default RBACService;
