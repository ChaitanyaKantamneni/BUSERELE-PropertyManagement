import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-amenities',
  standalone: true,
  imports: [ReactiveFormsModule,HttpClientModule],
  templateUrl: './add-amenities.component.html',
  styleUrl: './add-amenities.component.css'
})
export class AddAmenitiesComponent implements OnInit {
  constructor(public http:HttpClient){}
  ngOnInit(): void {
  }
  AminitiesForm:any=new FormGroup({
    name:new FormControl()
  })

  public AminitiesAddedSuccesfull:string='';
  messageColor:any={red:false,green:false};
  AminitiesSubmit(){
    console.log(this.AminitiesForm);
    const Aminities={
      AminitieName:this.AminitiesForm.get('name').value
    }
    this.http.post("https://localhost:7190/api/Users/InsAminities", Aminities, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (result: any) => {
        if (result.message == "Aminities Added successfully!") {
          this.AminitiesAddedSuccesfull = result.Message; 
          this.messageColor ={red:false,green:true};
        } else {
          this.AminitiesAddedSuccesfull = "Aminities Added failed!"; 
          this.messageColor = {red:true,green:false};
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.AminitiesAddedSuccesfull=error.error;
        this.messageColor={red:true,green:false};
      },
      complete: () => {
        console.log('Request completed');
      }
    });
  }
}
