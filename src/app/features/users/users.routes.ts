import { Routes } from "@angular/router";
import { Users } from "./users/users";
import { UserDetails } from "./user-details/user-details";

export const USERS_ROUTES:Routes = [
    { path:'', component:Users },
    { path:'user-detail', component:UserDetails },
];