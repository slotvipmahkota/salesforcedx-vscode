/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60
}

/**
 * Any numeric `Logger` level.
 */
export type LoggerLevelValue = LoggerLevel | number;

/**
 * An object
 */
export type Fields = Record<string, unknown>;

/**
 * All possible field value types.
 */
export type FieldValue = string | number | boolean | Fields;

/**
 * Log line interface
 */
export interface LogLine {
  name: string;
  hostname: string;
  pid: string;
  log: string;
  level: number;
  msg: string;
  time: string;
  v: number;
}

export interface ILogger {
  getName(): string;
  getLevel(): LoggerLevelValue;
  setLevel(level?: LoggerLevelValue): ILogger;
  shouldLog(level: LoggerLevelValue): boolean;
  getBufferedRecords(): LogLine[];
  readLogContentsAsText(): string;
  child(name: string, fields?: Fields): ILogger;
  addField(name: string, value: FieldValue): ILogger;
  trace(...args: unknown[]): ILogger;
  debug(...args: unknown[]): ILogger;
  info(...args: unknown[]): ILogger;
  warn(...args: unknown[]): ILogger;
  error(...args: unknown[]): ILogger;
  fatal(...args: unknown[]): ILogger;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getLoggerInstance = (instanceName: string): ILogger => {
  return {} as ILogger;
};
