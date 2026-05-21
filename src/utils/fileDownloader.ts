import { Directory, File, Paths } from 'expo-file-system';

/* 
* @uri string representing the URL to desired file to download go cache
* @dest string representing destination to download file to within the cache
* @returns path to downloaded file (e.g. ${cacheDirectory}/pdfs/sample.pdf)
*/
async function downloadFileToDirectory(url: string, dest: string): Promise<string | null> {
    try {
      const directory = createNewDirectory(dest);
      const output = await File.downloadFileAsync(url, directory);
      return output.uri; 
    } catch (error) {
      console.error(error);
    }
    return null;
}

/**
 * @description internal utility function for idempotently creating a directory
 * @param name name of directory to create
 * @returns directory instance
 */
function createNewDirectory(name: string): Directory {
    const directory = new Directory(Paths.cache, name);
    directory.create({ idempotent: true });
    return directory;
}

/**
 * 
 */
export async function downloadFile(url: string, dest: string) {
  const uri = await downloadFileToDirectory(url, dest);
  if (!uri) {
    return;
  }

}