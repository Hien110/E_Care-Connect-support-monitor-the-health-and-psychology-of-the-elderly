import React from "react";

import ROUTE_PATH from "../constants/routePath";

// Auth routes
const RegisterUserPage = React.lazy(() => import("../pages/Auth/RegisterUserPage"));

const AppRoutes = [

    // Auth routes
    { path: ROUTE_PATH.REGISTER, page: RegisterUserPage }

]

export default AppRoutes;