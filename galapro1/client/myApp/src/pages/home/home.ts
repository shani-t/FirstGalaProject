import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import {
  FormGroup,
  FormBuilder,
  Validators
} from "../../../node_modules/@angular/forms";
import { HomeService } from "./home.service";
import { Observable } from 'rxjs/Observable';
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
   form: FormGroup;
   errMessaage :string;
   isInvalid :boolean =false;
  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private homeService: HomeService,
  ) {
    this.form = this.formBuilder.group({
      data: [""],
      isChecked: [false,""]
    });

  }
  submitData() {
    console.log("click on Submit");
    this.homeService.sendData(
      this.form.value.data,
      this.form.value.isChecked
    );
    this.homeService.geValidationListener().subscribe(validation=>{
        this.errMessaage = validation.errMessage;
        this.isInvalid = validation.isInvalid;
    })
  }
  updateData() {
    console.log("click on checkBox");
  }
  addingDefaultURL(){
    this.homeService.addingDefault('www.google.com');
  }

}
