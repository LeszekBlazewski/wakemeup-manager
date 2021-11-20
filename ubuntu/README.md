# How to prepare an autoinstall Ubuntu 20.04 ISO

## Image creation

### Install necessary tools

```bash
sudo apt update -y
sudo apt install -y xorriso fakeroot isolinux syslinux p7zip-full
```

### Download Ubuntu image

```bash
wget https://ubuntu.volia.net/ubuntu-releases/20.04.3/ubuntu-20.04.3-live-server-amd64.iso
```

### Create a directory to extract ISO into

```bash
mkdir -p iso/nocloud/
```

### Extract the image

```bash
7z x ubuntu-20.04.3-live-server-amd64.iso -x'![BOOT]' -oiso
```

### Create empty `meta-data` file

```bash
touch iso/nocloud/meta-data
```

### Copy prepared `user-data` file from cwd

```bash
cp user-data iso/nocloud/user-data
```

### Update boot flags with cloud-init autoinstall

Should look similar to this: 

```initrd=/casper/initrd quiet autoinstall ds=nocloud;s=/cdrom/nocloud/ ---```

```bash
sed -i 's|---|autoinstall ds=nocloud\\\;s=/cdrom/nocloud/ ---|g' iso/boot/grub/grub.cfg
sed -i 's|---|autoinstall ds=nocloud;s=/cdrom/nocloud/ ---|g' iso/isolinux/txt.cfg
```

### Disable mandatory md5 checksum on boot

```bash
md5sum iso/.disk/info > iso/md5sum.txt
sed -i 's|iso/|./|g' iso/md5sum.txt
```

### Create Install ISO from extracted dir

```bash
xorriso -as mkisofs -r \
  -V Ubuntu\ custom\ amd64 \
  -o ubuntu-20.04.3-live-server-amd64-autoinstall.iso \
  -J -l -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot \
  -boot-load-size 4 -boot-info-table \
  -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot \
  -isohybrid-gpt-basdat -isohybrid-apm-hfsplus \
  -isohybrid-mbr /usr/lib/ISOLINUX/isohdpfx.bin  \
  iso/boot iso
```
