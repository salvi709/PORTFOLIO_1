import argparse
import math
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mesh", required=True)
    parser.add_argument("--render", required=True)
    parser.add_argument("--blend", required=True)
    parser.add_argument("--style", choices=("studio", "product", "dramatic"), default="studio")
    parser.add_argument("--resolution", type=int, default=768)
    parser.add_argument("--transparent", action="store_true")
    values = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return parser.parse_args(values)


def import_mesh(path):
    extension = os.path.splitext(path)[1].lower()
    importers = {
        ".obj": lambda: bpy.ops.wm.obj_import(filepath=path),
        ".glb": lambda: bpy.ops.import_scene.gltf(filepath=path),
        ".gltf": lambda: bpy.ops.import_scene.gltf(filepath=path),
        ".fbx": lambda: bpy.ops.import_scene.fbx(filepath=path),
        ".stl": lambda: bpy.ops.wm.stl_import(filepath=path),
        ".ply": lambda: bpy.ops.wm.ply_import(filepath=path),
    }
    if extension not in importers:
        raise ValueError(f"Unsupported mesh extension: {extension}")
    importers[extension]()
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("The imported file contains no mesh objects.")
    return meshes


def bounds(objects):
    points = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return minimum, maximum


def normalize(objects):
    minimum, maximum = bounds(objects)
    size = maximum - minimum
    longest = max(size.x, size.y, size.z, 0.0001)
    scale = 2.4 / longest
    center = (minimum + maximum) * 0.5
    for obj in objects:
        obj.location -= center
        obj.scale *= scale
    bpy.context.view_layer.update()
    minimum, _ = bounds(objects)
    for obj in objects:
        obj.location.z -= minimum.z
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    bpy.context.view_layer.update()
    minimum, maximum = bounds(objects)
    return maximum - minimum


def add_material_if_missing(objects):
    for obj in objects:
        if obj.data.materials:
            continue
        material = bpy.data.materials.new("Generated Material")
        material.diffuse_color = (0.42, 0.52, 0.72, 1.0)
        material.use_nodes = True
        principled = material.node_tree.nodes.get("Principled BSDF")
        principled.inputs["Base Color"].default_value = (0.32, 0.46, 0.72, 1.0)
        principled.inputs["Roughness"].default_value = 0.42
        obj.data.materials.append(material)


def add_area(name, location, energy, size, color, target):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    point_at(light, target)
    return light


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def create_scene(style, object_size, transparent):
    target = (0.0, 0.0, max(object_size.z * 0.48, 0.5))
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")

    if style == "dramatic":
        background.inputs["Color"].default_value = (0.008, 0.012, 0.025, 1.0)
        background.inputs["Strength"].default_value = 0.16
        add_area("Key", (3.8, -4.2, 5.0), 1050, 3.0, (1.0, 0.48, 0.22), target)
        add_area("Rim", (-3.2, 1.5, 4.2), 1250, 2.2, (0.18, 0.42, 1.0), target)
    elif style == "product":
        background.inputs["Color"].default_value = (0.055, 0.055, 0.065, 1.0)
        background.inputs["Strength"].default_value = 0.45
        add_area("Key", (3.7, -4.0, 5.2), 1150, 4.2, (1.0, 0.88, 0.74), target)
        add_area("Fill", (-3.0, -2.0, 3.0), 700, 4.0, (0.58, 0.72, 1.0), target)
        add_area("Rim", (0.4, 3.2, 4.5), 900, 3.0, (1.0, 1.0, 1.0), target)
    else:
        background.inputs["Color"].default_value = (0.025, 0.035, 0.055, 1.0)
        background.inputs["Strength"].default_value = 0.35
        add_area("Key", (3.8, -4.4, 5.2), 1000, 4.0, (1.0, 0.78, 0.62), target)
        add_area("Fill", (-3.2, -1.8, 3.2), 650, 3.5, (0.48, 0.68, 1.0), target)
        add_area("Rim", (0.0, 3.3, 4.4), 850, 2.8, (0.72, 0.84, 1.0), target)

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0.0, 0.0, -0.025))
    ground = bpy.context.object
    ground.name = "Ground"
    material = bpy.data.materials.new("Ground Material")
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (0.025, 0.03, 0.04, 1.0)
    principled.inputs["Roughness"].default_value = 0.58
    ground.data.materials.append(material)

    camera_data = bpy.data.cameras.new("Camera")
    camera = bpy.data.objects.new("Camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (4.0, -5.0, max(3.0, object_size.z * 1.45))
    camera.data.lens = 58
    point_at(camera, target)
    bpy.context.scene.camera = camera
    bpy.context.scene.render.film_transparent = transparent


def configure_render(render_path, resolution):
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = render_path
    scene.render.film_transparent = scene.render.film_transparent
    scene.render.image_settings.color_depth = "8"
    scene.render.resolution_percentage = 100
    scene.view_settings.look = "AgX - Medium High Contrast"


def main():
    args = parse_args()
    os.makedirs(os.path.dirname(args.render), exist_ok=True)
    os.makedirs(os.path.dirname(args.blend), exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    objects = import_mesh(os.path.abspath(args.mesh))
    object_size = normalize(objects)
    add_material_if_missing(objects)
    create_scene(args.style, object_size, args.transparent)
    configure_render(os.path.abspath(args.render), args.resolution)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
