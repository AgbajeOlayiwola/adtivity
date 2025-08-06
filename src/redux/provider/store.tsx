import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { combineReducers } from "redux"
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist"
import storage from "redux-persist/lib/storage"
import { mutationApi } from "../api/mutationApi"
import { queryApi } from "../api/queryApi"
import agentDetailsReducer from "../slices/agentDetailsSlice"
import documentReducer from "../slices/documents"
import merchantCountReducer from "../slices/merchantCount"
import profileImageReducer from "../slices/profileImageSlice"
import progileReducer from "../slices/profileSlice"
import tokenReducer from "../slices/userTokenSlice"
import yearlyTargetReducer from "../slices/yearlyTargetSlice"
const reducers = combineReducers({
  [mutationApi.reducerPath]: mutationApi.reducer,
  [queryApi.reducerPath]: queryApi.reducer,
  token: tokenReducer,
  yearlyTarget: yearlyTargetReducer,
  agentDetails: agentDetailsReducer,
  profile: progileReducer,
  profieImage: profileImageReducer,
  merchantCount: merchantCountReducer,
  documents: documentReducer,
})

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "token",
    "yearlyTarget",
    "agentDetails",
    "profile",
    "profieImage",
    "merchantCount",
    "documents",
  ],
}

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(mutationApi.middleware, queryApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
setupListeners(store.dispatch)
export const persistor = persistStore(store)
