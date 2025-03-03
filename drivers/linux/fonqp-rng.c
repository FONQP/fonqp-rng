#include <linux/module.h>
#include <linux/usb.h>
#include <linux/hw_random.h>
#include <linux/slab.h>

#define FONQP_RNG_VENDOR_ID 0x10C4  // Silicon Labs CP2102 Vendor ID
#define FONQP_RNG_PRODUCT_ID 0xEA60 // CP2102 Product ID
#define FONQP_RNG_READ_SIZE 64      // 10-bit random number fits in 2 bytes

#define FONQP_RNG_OUT_EP 0x02 // Endpoint to send data
#define FONQP_RNG_IN_EP 0x81  // Endpoint to receive data
#define USB_TIMEOUT 100       // 100ms timeout

static struct usb_device *usb_dev;
static struct usb_interface *usb_iface;
static char *usb_buffer;
static dma_addr_t usb_dma;

// HRNG read function
static int fonqp_rng_read(struct hwrng *rng, void *data, size_t max, bool wait)
{
    int retval, actual_length;

    if (!usb_dev)
        return -ENODEV;

    retval = usb_bulk_msg(usb_dev,
                          usb_rcvbulkpipe(usb_dev, FONQP_RNG_IN_EP),
                          usb_buffer,
                          min(max, FONQP_RNG_READ_SIZE),
                          &actual_length,
                          USB_TIMEOUT);
    if (retval)
        return retval;

    // Ensure actual_length does not exceed max
    size_t bytes_to_copy = min(max, (size_t)actual_length);
    memcpy(data, usb_buffer, bytes_to_copy);

    return bytes_to_copy;  // Return only the copied bytes
}


// HRNG data present function
// static bool data_present(struct usb_device *udev)
// {
//     int retval;
//     unsigned char send_buf = '1';
//     unsigned char recv_buf;
//     int actual_length;

//     // Send "1" to the device
//     retval = usb_bulk_msg(udev, usb_sndbulkpipe(udev, FONQP_RNG_OUT_EP),
//                           &send_buf, 1, &actual_length, USB_TIMEOUT);
//     if (retval < 0)
//     {
//         pr_err("FONQP RNG: Failed to send data (%d)\n", retval);
//         return false;
//     }

//     // Receive response from the device
//     retval = usb_bulk_msg(udev, usb_rcvbulkpipe(udev, FONQP_RNG_IN_EP),
//                           &recv_buf, 1, &actual_length, USB_TIMEOUT);
//     if (retval < 0)
//     {
//         pr_err("FONQP RNG: Failed to receive data (%d)\n", retval);
//         return false;
//     }

//     // Check if received 'Y'
//     return (recv_buf == 'Y');
// }

// HRNG structure
static struct hwrng fonqp_rng = {
    .name = "fonqp-rng",
    // .data_present = fonqp_rng_data_present,
    .read = fonqp_rng_read,
    .quality = 1000, // Higher means better randomness
};

// USB probe function
static int fonqp_rng_probe(struct usb_interface *interface, const struct usb_device_id *id)
{
    usb_dev = interface_to_usbdev(interface);
    usb_iface = interface;

    usb_buffer = usb_alloc_coherent(usb_dev, FONQP_RNG_READ_SIZE, GFP_KERNEL, &usb_dma);
    if (!usb_buffer)
        return -ENOMEM;

    hwrng_register(&fonqp_rng);
    pr_info("fonqp_rng: Registered as hardware RNG\n");

    return 0;
}

// USB disconnect function
static void fonqp_rng_disconnect(struct usb_interface *interface)
{
    hwrng_unregister(&fonqp_rng);

    if (usb_buffer)
        usb_free_coherent(usb_dev, FONQP_RNG_READ_SIZE, usb_buffer, usb_dma);

    usb_dev = NULL;
    pr_info("fonqp_rng: Unregistered\n");
}

// USB device ID table
static const struct usb_device_id fonqp_rng_table[] = {
    {USB_DEVICE(FONQP_RNG_VENDOR_ID, FONQP_RNG_PRODUCT_ID)},
    {}};
MODULE_DEVICE_TABLE(usb, fonqp_rng_table);

// USB driver structure
static struct usb_driver fonqp_rng_driver = {
    .name = "fonqp-rng",
    .id_table = fonqp_rng_table,
    .probe = fonqp_rng_probe,
    .disconnect = fonqp_rng_disconnect,
};
module_usb_driver(fonqp_rng_driver);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Prasanna Paithankar <paithankarprasanna@gmail.com>");
MODULE_DESCRIPTION("FONQP IIT Kharagpur Hardware RNG Driver");
