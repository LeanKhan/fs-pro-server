/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as _fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

/**
 * Reads a CSV file and creates objects from it.
 */
export async function readCSVFileAsync(filename: string): Promise<{data: any[]; rowCount: number}> {
  const data: any[] = [];

  return new Promise((resolve, reject) => {
    _fs
      .createReadStream(path.resolve(__dirname, '../files', filename))
      .pipe(csv.parse({ headers: true, trim: true }))
      .on('error', (error: any) => {
        return reject(error);
      })
      .on('data', (row: any) => {
        //   transform rows here...
        data.push(objectifyColumn(row));
      })
      .on('end', (rowCount: number) => {
        resolve({data, rowCount});
      });
  });
}

/**
 * Reads a CSV file and creates objects from it.
 */
export async function readCSVFileUploadAsync(file: any): Promise<{data: any[]; rowCount: number}> {
  const data: any[] = [];

  return new Promise((resolve, reject) => {
  csv.parseFile(file, { headers: true, trim: true })
      .on('error', (error: any) => {
        return reject(error);
      })
      .on('data', (row: any) => {
        //   transform rows here...
        data.push(objectifyColumn(row));
      })
      .on('end', (rowCount: number) => {
        resolve({data, rowCount});
      });
  });
}

/**
 * Creates objects for columns with dot-notation names
 */
function objectifyColumn(obj: any): any {
    /**
     * You get an object say {'a': 1, 'b.p': 2, 'b.q': 3, 'c.x': 4}
     * Run through each property... and if the property name is splitable,
     * Take the first element of the split as an object and save it to the main obj
     * then the value of that property put in object.
     *
     * then delete property.
     *
     * At the end you should have that new object with its properties
     * added to the initial object.
     */

     const keys = Object.keys(obj);
     keys.forEach(key => {
        if(key.includes(".")) {
            const key_split = key.split(".");

            // eslint-disable-next-line no-prototype-builtins
            if(!obj.hasOwnProperty(key_split[0])) {
                obj[key_split[0]] = {};
            }

            // set the value of obj['Address']['Country'] to obj['Address.Country']
            obj[key_split[0]][key_split[1]] = obj[key];

            // delete the field
            delete obj[key];
        }
     });

     return obj;
}