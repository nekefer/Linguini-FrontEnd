import * as React from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles/app.css";

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
