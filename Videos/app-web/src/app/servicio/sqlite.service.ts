import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  public dbready: BehaviorSubject<boolean>
  public isWeb: boolean;
  public isIOS: boolean;
  public dbName: string;

  constructor(
    private http: HttpClient
  ) { 
    this.dbready = new BehaviorSubject(false);
    this.isWeb= false;
    this.isIOS= false;
    this.dbName= '';
  }

  async init(){
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform == 'android'){
      try{
        await sqlite.requestPermissions();
      } catch(error){
        console.error("Esta app necesita permisos para funcionar")
      }
    } else if (info.platform == 'web'){
      this.isWeb = true;
      await sqlite.initWebStore();
    }else if (info.platform == "ios"){
      this.isIOS = true;
    }

    this.setupDatabase();
    
    
  }

  async setupDatabase() {
    const dbSetup = await Preferences.get({ key: 'first_setup_key' });
    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbready.next(true);
    }
  }

  async downloadDatabase() {
    this.http.get('assets/db1/db1.json').subscribe(async (jsonExport: JsonSQLite) => {
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

      if (isValid.result) {
        this.dbName = jsonExport.database;
        await CapacitorSQLite.importFromJson({ jsonstring });
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName });
        await Preferences.set({ key: 'first_setup_key', value: '1' });
        await Preferences.set({ key: 'dbname', value: this.dbName });
        this.dbready.next(true);
      }
    });
  }
  async getDbName(){

    if(!this.dbName){
    
      const dbname = await Preferences.get({ key: 'dbname'})
    
      if(dbname.value){
        this.dbName = dbname.value
      }
    
    }
    return this.dbName
  }

  async create(producto: any){
    const sql = 'INSERT INTO productos (presupuesto, unidad, cantidad, producto, valor_unitario, valor_total, fecha_adquisicion, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set:[
        {
          statement: sql,
          values: [
            producto.presupuesto,
            producto.unidad,
            producto.cantidad,
            producto.producto,
            producto.valor_unitario,
            producto.valor_total,
            producto.fecha_adquisicion,
            producto.proveedor

          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if(this.isWeb){
        CapacitorSQLite.saveToStore({ database: dbName});
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async read() {
    const sql = 'SELECT * FROM productos';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      return response.values;
    }).catch(err => Promise.reject(err));
  }

  async update( producto: any, id: number ){
    let sql = 'UPDATE productos SET presupuesto=?, unidad=?, cantidad=?, producto=?, valor_unitario=?, valor_total=?, fecha_adquisicion=?, proveedor=?  WHERE id=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      set: [
        {
          statement: sql,
          values: [
            
            producto.presupuesto,
            producto.unidad,
            producto.cantidad,
            producto.producto,
            producto.valor_unitario,
            producto.valor_total,
            producto.fecha_adquisicion,
            producto.proveedor,
            id
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if(this.isWeb){
        CapacitorSQLite.saveToStore({ database: dbName});
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async delete(id: number) {
    const sql = 'DELETE FROM productos WHERE id=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [id]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err));
  }
}
