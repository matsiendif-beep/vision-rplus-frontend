'use client';
import { createContext, useContext } from 'react';

interface SidebarCtx { toggle: () => void; }
export const SidebarContext = createContext<SidebarCtx>({ toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);
