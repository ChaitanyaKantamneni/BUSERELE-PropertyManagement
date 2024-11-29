import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule,HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [ReactiveFormsModule,HttpClientModule],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css'
})
export class AddPropertyComponent implements OnInit {
  constructor(public apihttp:HttpClient){}
  ngOnInit(): void {
    this.generatePropertyID();
    this.propertyform.get('totalArea')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.propertyform.get('priceFor')?.valueChanges.subscribe(() => this.calculateTotalPrice());
  }
 

  calculateTotalPrice(): void {
    const totalArea = this.propertyform.get('totalArea')?.value;
    const priceFor = this.propertyform.get('priceFor')?.value;

    if (totalArea && priceFor) {
      const totalPrice = totalArea * priceFor;
      this.propertyform.get('propertyTotalPrice')?.setValue(totalPrice, { emitEvent: false }); // Avoid triggering valueChanges again
    } else {
      this.propertyform.get('propertyTotalPrice')?.setValue('', { emitEvent: false }); // Reset total price if either value is missing
    }
  }

  uploadedImages: { path: string; name: string }[] = [];
  selectedImage: string = '';
  isModalOpen: boolean = false;
  propertyInsStatus:any=''
  

  openModal(imagePath: string) {
    this.selectedImage = imagePath;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  deleteImage(image: { path: string }) {
    this.uploadedImages = this.uploadedImages.filter(img => img.path !== image.path);
    console.log('Image deleted:', image);
  }

  uploadImages() {
    const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
    if (fileInput.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            this.uploadedImages.push({ path: URL.createObjectURL(file), name: file.name });
        }
    }
  }

  generatePropertyID(){
    this.apihttp.get("https://localhost:7190/api/Users/getautopropertyID", { responseType: 'text' }).subscribe((response: string) => {
      this.propertyform.patchValue({ id: response });
      console.log('Generated Property ID:', response);
    }, error => {
      console.error('Error fetching property ID:', error);
    });
  }
  // insertpropertydetails() {  
  //   const data = {
  //     id: this.propertyform.get('id')?.value,
  //     developedby: this.propertyform.get('developedby')?.value,
  //     propertyTitle: this.propertyform.get('propertyTitle')?.value,
  //     mobileNumber: this.propertyform.get('mobileNumber')?.value,
  //     emailId: this.propertyform.get('emailId')?.value,
  //     Address: this.propertyform.get('Address')?.value,
  //     Landmark: this.propertyform.get('Landmark')?.value,
  //     country: this.propertyform.get('country')?.value,
  //     state: this.propertyform.get('state')?.value,
  //     city: this.propertyform.get('city')?.value,
  //     nearBy: this.propertyform.get('nearBy')?.value,
  //     zip_postalcode: this.propertyform.get('zip_postalcode')?.value,
  //     reraCertificateNumber: this.propertyform.get('reraCertificateNumber')?.value,
  //     propertyApprovedBy: this.propertyform.get('propertyApprovedBy')?.value,
  //     propertyType: this.propertyform.get('propertyType')?.value,
  //     propertyFor: this.propertyform.get('propertyFor')?.value,
  //     propertyStatus: this.propertyform.get('propertyStatus')?.value,
  //     propertyFacing: this.propertyform.get('propertyFacing')?.value,
  //     totalblocks: this.propertyform.get('totalblocks')?.value,
  //     totalFloors: this.propertyform.get('totalFloors')?.value,
  //     totalNoofFlats: this.propertyform.get('totalNoofFlats')?.value,
  //     blockName: this.propertyform.get('blockName')?.value,
  //     propertyOnWhichFloor: this.propertyform.get('propertyOnWhichFloor')?.value,
  //     noOfBedrooms: this.propertyform.get('noOfBedrooms')?.value,
  //     noOfBathrooms: this.propertyform.get('noOfBathrooms')?.value,
  //     noOfBalconies: this.propertyform.get('noOfBalconies')?.value,
  //     noOfParkings: this.propertyform.get('noOfParkings')?.value,
  //     areaType: this.propertyform.get('areaType')?.value,
  //     totalArea: this.propertyform.get('totalArea')?.value,
  //     carpetArea: this.propertyform.get('carpetArea')?.value,
  //     priceFor: this.propertyform.get('priceFor')?.value,
  //     propertyTotalPrice: this.propertyform.get('propertyTotalPrice')?.value,
  //     amenitiesCharges: this.propertyform.get('amenitiesCharges')?.value,
  //     maintenanceCharges: this.propertyform.get('maintenanceCharges')?.value,
  //     corpusFund: this.propertyform.get('corpusFund')?.value,
  //     buildYear: this.propertyform.get('buildYear')?.value,
  //     possessionDate:new Date(this.propertyform.get('possessionDate')?.value).toISOString(),
  //     listDate:new Date(this.propertyform.get('listDate')?.value).toISOString(),
  //     videoUpload: this.propertyform.get('videoUpload')?.value,
  //     websiteLink: this.propertyform.get('websiteLink')?.value,
  //     facebookLink: this.propertyform.get('facebookLink')?.value,
  //     pinterest: this.propertyform.get('pinterest')?.value,
  //     twitterLink: this.propertyform.get('twitterLink')?.value,
  //     googlelocationUrl: this.propertyform.get('googlelocationUrl')?.value,
  //     //availabilityOptions: this.propertyform.get('availabilityOptions')?.value
  //   };


  //   console.log('Form Data:', this.propertyform.value);
  //   console.log('country:', this.propertyform.get('country')?.value);
  //   console.log('state:',this.propertyform.get('state')?.value);
  //   console.log('propertType:',this.propertyform.get('propertyType')?.value);
  //   console.log('propertyFor:',this.propertyform.get('propertyFor')?.value);
  //   console.log('propertyStatus:',this.propertyform.get('propertyStatus')?.value);
  //   console.log('propertyFacing:',this.propertyform.get('propertyFacing')?.value);
  //   console.log('areaType:',this.propertyform.get('areaType')?.value);

  //   this.apihttp.post("https://localhost:7190/api/Users/insProperty", data, {
  //     headers: { 'Content-Type': 'application/json' }
  //   }).subscribe({
  //     next: (response: any) => {
  //       this.propertyInsStatus = response.Message;
  //       console.log("Data submitted successfully:", data);
  //     },
  //     error: (error) => {
  //       this.propertyInsStatus = "Error Inserting Property.";
  //       console.log("Error:", error);
  //     },
  //     complete: () => {
  //       console.log("Request completed");
  //     }
  //   });
  // }
  propertyform:any=new FormGroup({
    id:new FormControl(),
    developedby:new FormControl(),
    propertyTitle:new FormControl(),
    mobileNumber:new FormControl(),
    emailId:new FormControl(),
    Address:new FormControl(),
    Landmark:new FormControl(),
    country:new FormControl(),
    state:new FormControl(),
    city:new FormControl(),
    nearBy:new FormControl(),
    zip_postalcode:new FormControl(),
    reraCertificateNumber:new FormControl(),
    propertyApprovedBy:new FormControl(),
    propertyType:new FormControl(),
    propertyFor:new FormControl(),
    propertyStatus:new FormControl(),
    propertyFacing:new FormControl(),
    totalblocks:new FormControl(),
    totalFloors:new FormControl(),
    totalNoofFlats:new FormControl(),
    blockName:new FormControl(),
    propertyOnWhichFloor:new FormControl(),
    noOfBedrooms:new FormControl(),
    noOfBathrooms:new FormControl(),
    noOfBalconies:new FormControl(),
    noOfParkings:new FormControl(),
    areaType:new FormControl(),
    //totalArea:new FormControl(),
    totalArea: new FormControl('', [Validators.required, Validators.min(1)]),
    carpetArea:new FormControl(),
    //priceFor:new FormControl(),
    priceFor: new FormControl('', [Validators.required, Validators.min(1)]),
    //propertyTotalPrice:new FormControl(),
    propertyTotalPrice: new FormControl({ value: '', disabled: true }),
    amenitiesCharges:new FormControl(),
    maintenanceCharges:new FormControl(),
    corpusFund:new FormControl(),
    buildYear:new FormControl(),
    possessionDate:new FormControl(),
    listDate:new FormControl(),
    // propertyGallery:new FormControl(),
    // propertyFloorGallery:new FormControl(),
    // propertyDocuments:new FormControl(),
    // videoUpload:new FormControl(),
    websiteLink:new FormControl(),
    facebookLink:new FormControl(),
    pinterest:new FormControl(),
    twitterLink:new FormControl(),
    googlelocationUrl:new FormControl()
    //availabilityOptions:new FormControl()
  })

  insertpropertydetails() {
    const data = {
      ID: 0,
      PropertyId: this.propertyform.get('id')?.value,
      DevelopedBy: this.propertyform.get('developedby')?.value,
      PropertyTitle: this.propertyform.get('propertyTitle')?.value,
      MobileNumber: this.propertyform.get('mobileNumber')?.value,
      EmailID: this.propertyform.get('emailId')?.value,
      Address: this.propertyform.get('Address')?.value,
      LandMark: this.propertyform.get('Landmark')?.value,
      Country: this.propertyform.get('country')?.value,
      State: this.propertyform.get('state')?.value,
      City: this.propertyform.get('city')?.value,
      NearBy: this.propertyform.get('nearBy')?.value,
      ZIPCode: this.propertyform.get('zip_postalcode')?.value,
      ReraCertificateNumber: this.propertyform.get('reraCertificateNumber')?.value,
      PropertyApprovedBy: this.propertyform.get('propertyApprovedBy')?.value,
      PropertyType: this.propertyform.get('propertyType')?.value,
      PropertyFor: this.propertyform.get('propertyFor')?.value,
      PropertyStatus: this.propertyform.get('propertyStatus')?.value,
      PropertyFacing: this.propertyform.get('propertyFacing')?.value,
      TotalBlocks: this.propertyform.get('totalblocks')?.value,
      TotalFloors: this.propertyform.get('totalFloors')?.value,
      NoOfFlats: this.propertyform.get('totalNoofFlats')?.value,
      BlockName: this.propertyform.get('blockName')?.value,
      PropertyOnWhichFloor: this.propertyform.get('propertyOnWhichFloor')?.value,
      NoOfBedrooms: this.propertyform.get('noOfBedrooms')?.value,
      NoOfBathrooms: this.propertyform.get('noOfBathrooms')?.value,
      NoOfBalconies: this.propertyform.get('noOfBalconies')?.value,
      NoOfParkings: this.propertyform.get('noOfParkings')?.value,
      AreaType: this.propertyform.get('areaType')?.value,
      TotalArea: this.propertyform.get('totalArea')?.value,
      CarpetArea: this.propertyform.get('carpetArea')?.value,
      PriceFor: this.propertyform.get('priceFor')?.value,
      PropertyTotalPrice: this.propertyform.get('propertyTotalPrice')?.value,
      AmenitiesCharges: this.propertyform.get('amenitiesCharges')?.value,
      MaintenanceCharges: this.propertyform.get('maintenanceCharges')?.value,
      CorpusFund: this.propertyform.get('corpusFund')?.value,
      BuildYear: this.propertyform.get('buildYear')?.value,
      PossessionDate: this.propertyform.get('possessionDate')?.value ? new Date(this.propertyform.get('possessionDate')?.value).toISOString() : null,
      ListDate: this.propertyform.get('listDate')?.value ? new Date(this.propertyform.get('listDate')?.value).toISOString() : null,
      websiteurl: this.propertyform.get('websiteLink')?.value,
      Pinteresturl: this.propertyform.get('pinterest')?.value,
      Facebookurl: this.propertyform.get('facebookLink')?.value,
      Twitterurl: this.propertyform.get('twitterLink')?.value,
      GoogleLocationurl: this.propertyform.get('googlelocationUrl')?.value
    };

    console.log('Form Data:', this.propertyform.value);
    console.log('country:', this.propertyform.get('country')?.value);
    console.log('state:',this.propertyform.get('state')?.value);
    console.log('propertType:',this.propertyform.get('propertyType')?.value);
    console.log('propertyFor:',this.propertyform.get('propertyFor')?.value);
    console.log('propertyStatus:',this.propertyform.get('propertyStatus')?.value);
    console.log('propertyFacing:',this.propertyform.get('propertyFacing')?.value);
    console.log('areaType:',this.propertyform.get('areaType')?.value);


    if (this.propertyform.valid) {
      this.apihttp.post("https://localhost:7190/api/Users/insProperty", data, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: (response: any) => {
          this.propertyInsStatus = response.Message;
          console.log("Data submitted successfully:", response);
        },
        error: (error) => {
          this.propertyInsStatus = "Error Inserting Property.";
          console.error("Error details:", error);
        },
        complete: () => {
          console.log("Request completed");
        }
      });
    } else {
      console.log("Form is invalid");
    }
  }
  

  
  insertpropertyimages(){

  }
  submitproperty(){
    this.insertpropertydetails();
    this.insertpropertyimages();
  }
}
