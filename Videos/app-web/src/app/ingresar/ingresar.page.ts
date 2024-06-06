import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SqliteService } from '../servicio/sqlite.service';



@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  styleUrls: ['./ingresar.page.scss'],
})
export class IngresarPage implements OnInit {

  public producto: any = {
    presupuesto: '',
    unidad : '',
    producto: '',
    cantidad: '',
    valor_unitario: '',
    valor_total: '',
    fecha_adquisicion: '',
    proveedor: ''
  };
  public New: boolean = true;
  private id: number;
  

 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sqlite: SqliteService
  ) { 
    

  }

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    if (this.id !== 0) {
      this.New = false;
      this.Mostrar();
    }
  }

  Mostrar() {
    this.sqlite.read().then((productos: any[]) => {
      this.producto = productos.find(p => p.id === this.id);
    }).catch(err => {
      console.error(err);
    });
  }

  Save() {
    if (this.validarProducto()) {
      if (this.New) {
        this.sqlite.create(this.producto).then(() => {
          this.router.navigate(['/inicio']);
        }).catch(err => {
          console.error(err);
        });
      } else {
        this.sqlite.update(this.producto, this.id).then(() => {
          this.router.navigate(['/inicio']);
        }).catch(err => {
          console.error(err);
        });
      }
    } else {
      alert('Por favor, corrija los errores antes de guardar.');
    }
  }

  validarProducto(): boolean {
    if (!this.producto.presupuesto || !this.producto.unidad || !this.producto.producto || !this.producto.cantidad ||
        !this.producto.valor_unitario || !this.producto.valor_total || !this.producto.fecha_adquisicion || !this.producto.proveedor) {
      alert('Todos los campos son obligatorios.');
      return false;
    }

    if (this.producto.valor_unitario > this.producto.valor_total) {
      alert('El valor unitario no puede ser mayor al valor total.');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (this.producto.fecha_adquisicion < today) {
      alert('La fecha de adquisición no puede ser anterior a la fecha actual.');
      return false;
    }
  
    return true;
  }

 

  Delete() {
    this.sqlite.delete(this.id).then(() => {
      this.router.navigate(['/inicio']);
    }).catch(err => {
      console.error(err);
    });
  }



  irInicio(){
    this.router.navigateByUrl('/inicio');

  }

}
