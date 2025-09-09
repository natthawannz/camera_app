// import for camera permission
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [torch, setTorch] = useState(false);
    // camera reference
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, []);

  if (!cameraPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasMediaLibraryPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting media library permission...</Text>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const newPhoto = await cameraRef.current.takePictureAsync({ quality: 1 });
        setImage(newPhoto.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };
 // Save to gallery
  const handleSaveToGallery = async () => {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        setImage(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          {/* Retake (แดง) */}
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={() => setImage(null)}
          >
            <Ionicons name="refresh-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>

          {/* Save (ฟ้า) */}
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToGallery}
          >
            <Ionicons name="save-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
      />
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => setTorch(!torch)}>
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            size={30}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setFacing(facing === "back" ? "front" : "back")
          }
        >
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111", 
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  topControls: {
    position: "absolute",
    top: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#FF4444",
    borderWidth: 5,
    borderColor: "#fff",
  },
  previewImage: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  previewActions: {
    position: "absolute",
    bottom: 35,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 40,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: "#E63946", 
  },
  saveButton: {
    backgroundColor: "#1D9BF0", 
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
