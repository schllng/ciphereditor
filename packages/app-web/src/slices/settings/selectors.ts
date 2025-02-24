
import { ReducedMotionPreferenceOption, SettingsState, ThemeOption } from './types'

export const getAccessibilitySettings = (state: SettingsState): {
  theme: ThemeOption
  reducedMotionPreference: ReducedMotionPreferenceOption
} => ({
  theme: state.theme,
  reducedMotionPreference: state.reducedMotionPreference
})

export const getShortcutBindings = (state: SettingsState): {
  [name: string]: string | string[]
} => state.shortcutBindings
