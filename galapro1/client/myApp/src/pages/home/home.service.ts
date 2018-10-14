import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { redirectData } from "./redirectData.model";
import { Subject } from "../../../node_modules/rxjs/Subject";

@Injectable()
export class HomeService {
  private invalidUrl = new Subject<{
    errMessage: string;
    isInvalid: boolean;
  }>();

  constructor(private http: HttpClient) {}

  sendData(data: string, isChecked: boolean) {
    const redirect: redirectData = { data: data, isChecked: isChecked };
    this.http
      .post<{ data: string }>("http://localhost:3000/api/update", redirect)
      .subscribe(
        responseData => {
          this.invalidUrl.next({
            errMessage: "",
            isInvalid: false,
          });

          window.open(responseData.data);
        },
        err => {
          this.invalidUrl.next({
            errMessage: err.error,
            isInvalid: true
          });
        }
      );
  }

  addingDefault(data: string) {
    const redirect: redirectData = { data: data, isChecked: true };
    this.http
      .post<{ message: string }>(
        "http://localhost:3000/api/addDefault",
        redirect
      )
      .subscribe(responseData => {
        console.log(responseData.message);
        return responseData;
      });
  }

  geValidationListener() {
    return this.invalidUrl.asObservable();
  }
}
