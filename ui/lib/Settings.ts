import { ComponentBase } from "./ComponentBase";
import type { IComponentBase } from "./ComponentBase";

export type DefaultPage        = "home" | "weather-ai";
export type LLMProvider        = "env-default" | "claude" | "openai" | "gemini" | "groq" | "ollama" | "bedrock" | "openai-compat";
export type FontFamily         = "system" | "serif" | "monospace";
export type FontSizeScale      = "small" | "medium" | "large" | "xl";
export type FontWeightSetting  = "light" | "regular" | "medium" | "bold";
export type FontStyleSetting   = "normal" | "italic";

export interface ISettings extends IComponentBase {
  online:        boolean;
  stateSync:     boolean;
  llmProvider:   LLMProvider;
  theme:         "light" | "dark" | "system";
  notifications: boolean;
  defaultCity:   string;
  defaultPage:   DefaultPage;
  fontFamily:    FontFamily;
  fontSize:      FontSizeScale;
  fontWeight:    FontWeightSetting;
  fontStyle:     FontStyleSetting;
}

export class Settings extends ComponentBase implements ISettings {
  constructor(
    id:                        string,
    tag:                       string,
    public online:             boolean                     = true,
    public stateSync:          boolean                     = true,
    public llmProvider:        LLMProvider                 = "env-default",
    public theme:              "light" | "dark" | "system" = "system",
    public notifications:      boolean                     = true,
    public defaultCity:        string                      = "",
    public defaultPage:        DefaultPage                 = "home",
    public fontFamily:         FontFamily                  = "system",
    public fontSize:           FontSizeScale               = "medium",
    public fontWeight:         FontWeightSetting           = "regular",
    public fontStyle:          FontStyleSetting            = "normal",
  ) { super(id, tag); }
}
