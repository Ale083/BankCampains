import { PERMISOS } from "./permisosEnum";

const RBACService = (() => {
  const rolesPermisos = {
    'GERENCIA': [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.REGISTRAR_USUARIOS,
      PERMISOS.VER_HISTORIAL,
      PERMISOS.EXPLORAR_PROSPECTOS,
      PERMISOS.PROB_ADQUISICION_PRODUCTO,
      PERMISOS.INTERPRETACION_PROB,
      PERMISOS.RECOMENDACION_SUGERIDA,
    ],
    'EJECUTIVO': [
      PERMISOS.VER_CONSULTAS_POR_FILTRO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_HISTORIAL,
      PERMISOS.EXPLORAR_PROSPECTOS,
      PERMISOS.PROB_ADQUISICION_PRODUCTO,
      PERMISOS.INTERPRETACION_PROB,
      PERMISOS.RECOMENDACION_SUGERIDA,
      PERMISOS.DEFINIR_VALORES_PARAMETRICOS,
      PERMISOS.ANALISIS_VALORES_INFLUYENTES,
      PERMISOS.SIMULACION_ESCENARIOS,
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
