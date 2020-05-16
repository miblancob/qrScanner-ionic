import { Injectable } from "@angular/core";
import { Registro } from "../models/registro.model";
import { Storage } from "@ionic/storage";
import { NavController } from "@ionic/angular";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { File } from "@ionic-native/file/ngx";
import { EmailComposer } from "@ionic-native/email-composer/ngx";

const fileName = "registros.csv";

@Injectable({
  providedIn: "root",
})
export class DataLocalService {
  guardados: Registro[] = [];

  constructor(
    private localStorage: Storage,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
  ) {
    this.cargarRegistros();
  }

  guardarRegistro(format: string, text: string) {
    const nuevoRegistro = new Registro(format, text);
    this.guardados = [nuevoRegistro, ...this.guardados];
    this.localStorage.set("guardados", this.guardados);

    this.abrirRegistro(nuevoRegistro);
  }

  cargarRegistros() {
    this.localStorage.get("guardados").then((res) => {
      this.guardados = res || [];
    });
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward("/tabs/tab2");
    switch (registro.type) {
      case "http":
        this.iab.create(registro.text, "_system");
        break;

      case "geo":
        this.navCtrl.navigateForward(`/tabs/tab2/mapa${registro.text}`);
        break;

      default:
        break;
    }
  }

  enviarCorreo() {
    const titulos = "Tipo,Formato,Creado en,Texto\n";
    const arrTemp = [];

    arrTemp.push(titulos);
    this.guardados.forEach((registro) => {
      const fila = `${registro.type},${registro.format},${
        registro.created
      },${registro.text.replace(",", " ")}\n`;
      arrTemp.push(fila);
    });
    this.crearArchivoFisico(arrTemp.join(""));
  }

  crearArchivoFisico(text: string) {
    this.file
      .checkFile(this.file.dataDirectory, fileName)
      .then((existe) => {
        console.log(existe);
        return this.escribirEnArchivo(text);
      })
      .catch((err) => {
        return this.file
          .createFile(this.file.dataDirectory, fileName, false)
          .then((creado) => {
            this.escribirEnArchivo(text);
          })
          .catch((err2) => {
            console.log(err2);
          });
      });
  }

  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, fileName, text);

    const archivo = `${this.file.dataDirectory}/registros.csv`;

    const email = {
      to: "miguelblancobazaga@gmail.com",
      attachments: [archivo],
      subject: "Backup de scans",
      body: "Aquí tiene sus backups de los scans - <strong>ScanApp</strong>",
      isHtml: true,
    };

    // Send a text message using default options
    this.emailComposer.open(email);
  }
}
