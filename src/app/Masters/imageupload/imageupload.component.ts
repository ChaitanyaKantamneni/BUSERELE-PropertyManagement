import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-imageupload',
  standalone: true,
  imports: [HttpClientModule, FormsModule,NgIf,NgFor,NgClass],
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.css']
})
export class ImageuploadComponent implements OnInit {
  selectedFiles: FileList | null = null;  // Store selected files
  uploadedImages: Array<{ path: string }> = [];  // Store paths of images to display
  uploadedImages1: Array<{ id: number, propID: string, fileName: string, mimeType: string, imageData: Blob, imageUrl: string }> = [];

  isModalOpen = false;  // Modal visibility flag
  selectedImage: string = '';  // Path of the image to be displayed in modal
  propID: string = 'PROP-0004';  // Example Property ID (can be set dynamically)
  editclicked: boolean = false;
  properties: Array<{ propID: string }> = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProperties();  // Initialize properties
  }

  fetchProperties(): void {
    // Simulated list of properties with IDs
    this.properties = [
      { propID: 'PROP-0001' },
      { propID: 'PROP-0002' },
      { propID: 'PROP-0003' },
      { propID: 'PROP-0004' }
    ];
    this.getImagesForProperty(this.propID);  // Fetch images for the default property
  }

  // Handle file selection and display image preview
  onFileSelect(event: any): void {
    if (event?.target?.files) {
      this.selectedFiles = event.target.files;

      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.uploadedImages = [];  // Clear previous images

        // Convert FileList to an array and create image previews
        Array.from(this.selectedFiles).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Push the data URL (base64 string) into the uploadedImages array
            this.uploadedImages.push({ path: reader.result as string });
          };
          reader.readAsDataURL(file);  // Read file as data URL for preview
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }

  // Handle image upload to backend
  uploadImages(): void {
    if (!this.propID || !this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      return;
    }

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
    });

    // Make HTTP request to upload the files
    this.http.post('https://localhost:7190/api/Users/upload', formData).subscribe(
      response => {
        console.log('Images uploaded successfully:', response);
        this.getImagesForProperty(this.propID);  // Refresh the images after upload
      },
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  // Open the modal to view image
  openModal(imagePath: string): void {
    this.selectedImage = imagePath;  // Set the selected image path
    this.isModalOpen = true;  // Show the modal
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;  // Hide the modal
    this.selectedImage = '';  // Clear the selected image path
  }

  // Delete an image from the uploaded list
  deleteImage(image: any): void {
    const index = this.uploadedImages.indexOf(image);

    console.log(index);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1); // Remove image from table
    }
  }
  

  deleteImage1(propertyId: string, imageId: number): void {
    // Send DELETE request to backend to remove the image from the database based on both property and image ID
    this.http.delete(`https://localhost:7190/api/Users/delete-image/${propertyId}/${imageId}`).subscribe(
      response => {
        console.log('Image deleted from database:', response);
  
        // Remove the image from the frontend list
        const index = this.uploadedImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedImages1.splice(index, 1); // Remove image from the UI list
        }
      },
      error => {
        console.error('Error deleting image:', error);
      }
    );
    console.log(propertyId),
    console.log(imageId)
  }

  // Handle property selection and image retrieval
  editproperty(propertyID: string): void {
    this.editclicked = true;
    this.propID = propertyID;  // Set the selected property ID
    this.getImagesForProperty(propertyID);  // Fetch associated images
  }

getImagesForProperty(propID: string): void {
  this.http.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
    // Process response and convert imageData to Blob URL
    this.uploadedImages1 = response.map((image: any) => {
      const byteCharacters = atob(image.imageData); // Decoding base64 to raw binary
      const byteArray = new Uint8Array(byteCharacters.length);

      // Copy the binary data into the byteArray
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: image.mimeType });

      // Create an object URL from the Blob
      const imageUrl = URL.createObjectURL(blob);

      return {
        ...image,
        propID: propID,
        imageUrl // Add the Blob URL to the image object
      };
    });

    console.log('Processed image array:', this.uploadedImages1);
  }, error => {
    console.error('Error fetching images:', error);
  });
}
}
