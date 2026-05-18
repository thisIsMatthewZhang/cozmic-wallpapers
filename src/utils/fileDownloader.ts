import { Directory, File, Paths } from 'expo-file-system';

/* 
* @uri string representing the URL to desired file to download go cache
* @dest string representing destination to download file to within the cache
* @returns path to downloaded file (e.g. ${cacheDirectory}/pdfs/sample.pdf)
*/
export async function downloadFileToCache(url: string, dest: string): string | null { 
    const destination = new Directory(Paths.cache, dest);
    try {
      destination.create();
      const output = await File.downloadFileAsync(url, destination);
      return output.uri; 
    } catch (error) {
      console.error(error);
    }
    return null;
}