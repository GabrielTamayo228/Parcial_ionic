import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SqliteService } from '../servicio/sqlite.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {

  public productos: any[] = [];
  public filteredProductos: any[] = [];
  public searchTerm: string = '';

  constructor(
    private sqlite: SqliteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Mostrar();
  }

  ionViewWillEnter() {
    this.Mostrar();
  }

  Mostrar() {
    this.sqlite.read().then((productos: any[]) => {
      this.productos = productos;
      this.filteredProductos= productos;
    }).catch(err => {
      console.error(err);
    });
  }

  filterProductos(){
    this.filteredProductos= this.productos.filter(producto => {
      return producto.producto.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  irIngresar(){
    this.router.navigate(['/ingresar', 0]);
  }

  VP(id: number) {
    this.router.navigate(['/ingresar', id]);
  }

  Update(id: number) {
    this.router.navigate(['/ingresar', id]);
  }

  Delete(id: number) {
    this.sqlite.delete(id).then(() => {
      this.Mostrar();
    }).catch(err => {
      console.error(err);
    });
  }

  

  irInicio(){
    this.router.navigateByUrl('/inicio');

  }

}
