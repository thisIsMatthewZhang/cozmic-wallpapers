import { Directory, File, Paths } from 'expo-file-system';
import { addAssetsToAlbumAsync, createAssetAsync, requestPermissionsAsync, createAlbumAsync, Asset, Album } from 'expo-media-library';

/**
 * @description internal utility function for idempotently creating a directory
 * @param name name of directory to create
 * @returns directory instance
 */
export function createNewDirectory(name: string): Directory {
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
 * @description IMPORTANT: Android requires an album to hold at least one asset. Account for this case when deploying to Android
 * @param title name for newly created album
 * @returns new Album instance
 */
export async function createNewAlbum(title: string, firstAsset: Asset) {
  await requestPermissionsAsync();
  const newAlbum = await createAlbumAsync(title, firstAsset);
  return newAlbum;
}

/**
 * @description creates media library assets for each file in a directory
 * @param directory directory containing files to convert into assets
 * @returns media library assets created from the directory contents
 */
export async function createAssetsFromDirectory(directory: Directory): Promise<Asset[]> {
  return Promise.all(
    directory.list().map((file) => createAssetAsync(file.uri)),
  );
}

/**
 * @description adds existing media library assets to the provided album
 * @param album album to add assets to
 * @param assets assets to add to the album
 */
export async function addAssetsToAlbum(album: Album, assets: Asset[]) {
  if (!album || !assets.length) return;
  await addAssetsToAlbumAsync(assets, album);
}
