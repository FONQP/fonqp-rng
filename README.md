<!-- <div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
        <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.png">
        <img alt="Project Logo" src="assets/logo-dark.png">
    </picture>
</div> -->
# FONQP RNG

This repository contains tools and device drivers to interface with Random Number Generators (RNGs) developed by the [Fiber Optics, Nano and Quantum Photonics Group](https://fonqp.github.io/) at the [Indian Institute of Technology Kharaagpur](http://www.iitkgp.ac.in/).

Information about the RNGs can be found [here](https://fonqp.github.io/rng/). Some documentation is also available in the [docs](docs/) directory.

There are 3 types of packages maintained in this repository:
- **RNG Toolbox**: A Tauri based GUI application to interface with the RNGs.
- **RNG Toolbox TUI**: A TUI based application to interface with the RNGs.
- **Device Drivers**: Device drivers for the RNGs.

## ⭳ Installation
To install the tools and device drivers, run the following commands:

### 🐧 Ubuntu:
```bash
sudo add-apt-repository ppa:prasanna-paithankar/fonqp
sudo apt install fonqp-rng
```

### 🐧 Fedora:
```bash
sudo dnf copr enable fonqp/fonqp
sudo dnf install fonqp-rng
```

### 🗔 Windows:
To be added.
<!-- Download the MSI installer from the [releases]( -->

### 🛠 Building from Source:
```bash
git clone https://github.com/PrasannaPaithankar/fonqp-rng.git
cd fonqp-rng
make
sudo make install
```

## 💻 Usage
The usage is pretty intuitive. Contact us or just drop questions in the discussions section of GitHub if you face any issues.

## 🪪 License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

***
&copy; 2025 Prasanna Paithankar \<paithankarprasanna@gmail.com\> 