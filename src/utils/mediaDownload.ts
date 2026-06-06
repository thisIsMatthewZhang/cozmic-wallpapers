import { Directory, File, Paths } from 'expo-file-system';
import { saveToLibraryAsync, requestPermissionsAsync } from 'expo-media-library';

// Client save flow:
// A temp directory is created -> URLs are downloaded to the directory ->
// files are saved to the user's media library -> temp directory is deleted.

/**
 * @description internal utility function for idempotently creating a directory
 * @param name name of directory to create
 * @returns directory instance
 */
export async function createNewDirectory(name: string): Promise<Directory> {
    const directory = new Directory(Paths.cache, name);
    directory.create({ idempotent: true });
    return directory;
}

/** 
* @param url string representing the URL to desired file to download go cache
* @param dest string representing destination to download file to within the cache
* @returns uri to downloaded file (e.g. ${cacheDirectory}/pdfs/sample.pdf)
*/
export async function downloadFileToDirectory(url: string | null, directory: Directory): Promise<string | null> {
    try {
      if (!url) throw new Error("Sorry! There was an issue with downloading your images.");
      const output = await File.downloadFileAsync(url, directory);
      return output.uri; 
    } catch (error) {
      console.error(error);
    }
    return null;
}

/**
 * @description saves each file in a directory to the user's media library
 * @param directory directory containing files to convert into assets
 */
export async function saveWallpapersToLibrary(directory: Directory): Promise<void> {
  await Promise.all(
    directory.list().map((file) => saveToLibraryAsync(file.uri)),
  );
}

/**
 * @description simple function called before album creation flow to ask user for media library permissions.
 * @returns PermissionResponse given by the async call
 */
export async function askUserForPermission() {
  const permissionResponse = await requestPermissionsAsync(true);
  if (!permissionResponse.granted) throw new Error("Media library permission is required to save wallpapers.");
  return permissionResponse;
}
