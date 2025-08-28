import React from "react";

import ROUTE_PATH from "../constants/routePath";

// Auth routes
const RegisterUserPage = React.lazy(() => import("../pages/Auth/RegisterUserPage"));
const LoginUserPage = React.lazy(() => import("../pages/Auth/LoginUserPage"));
const AppRoutes = [

    // Auth routes
    { path: ROUTE_PATH.REGISTER, page: RegisterUserPage },
    { path: ROUTE_PATH.LOGIN, page: LoginUserPage }

]

export default AppRoutes;