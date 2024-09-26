import type { DashboardApi, WidgetApi, YouTrack } from "youtrack-client"
import React, { createContext, useContext, type ReactNode } from "react"

import type { UserEntity } from "../types/entities"

type WidgetContextType = {
  dashboardApi: DashboardApi
  widgetApi: WidgetApi
  youtrack: YouTrack
  user: UserEntity
}

type WidgetContextProviderParams = WidgetContextType & {
  children: ReactNode
}

const WidgetContext = createContext<WidgetContextType>({} as WidgetContextType)

export const WidgetContextProvider = (params: WidgetContextProviderParams) => {
  const { children, ...props } = params
  return <WidgetContext.Provider value={props}>{children}</WidgetContext.Provider>
}

export const useWidgetContext = () => {
  return useContext(WidgetContext)
}
