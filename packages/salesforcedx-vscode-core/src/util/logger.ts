import { channelService } from '../channels';

let isDebugMode = true;
export const logger = {
  setDebugMode: (mode: boolean) => {
    isDebugMode = mode;
  },

  /**
   * Log a message to the VSCode channel output.  Will be visible to the extension user.
   *
   * @param message message to be displayed in the channel output
   */
  channel: (message: string) => {
    channelService.appendLine(message);
  },

  /**
   * Log a message to the VSCode channel output, prefixed with a timestamp.  Will be visible to the extension user.
   *
   * @param message message to be displayed in the channel output
   */
  channelWithTimestamp: (message: string) => {
    channelService.showCommandWithTimestamp(message);
  },

  /**
   * Log debug messages to the console and the channel output.
   * Note these logs are only visible when in development mode.
   *
   * @param message message to be displayed in the channel output
   * @param data optional data to be displayed in console only
   */
  debug: (message: string, data?: unknown) => {
    message = `W-14319389: ${message}`;
    if (!isDebugMode) {
      return;
    }

    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }

    channelService.showCommandWithTimestamp(message);
  }
};
